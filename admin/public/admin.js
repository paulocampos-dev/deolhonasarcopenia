document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-password-toggle]').forEach(function (widget) {
        var input = widget.querySelector('[data-password-input]');
        var btn = widget.querySelector('[data-password-toggle-btn]');
        var icon = widget.querySelector('[data-password-icon]');
        if (!input || !btn) return;

        btn.addEventListener('click', function () {
            var isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            icon.textContent = isHidden ? 'visibility_off' : 'visibility';
            btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
        });
    });

    document.querySelectorAll('[data-image-upload]').forEach(function (widget) {
        var fileInput = widget.querySelector('[data-image-file]');
        var hiddenInput = widget.querySelector('[data-image-value]');
        var preview = widget.querySelector('[data-image-preview]');
        var status = widget.querySelector('[data-image-status]');
        if (!fileInput) return;

        fileInput.addEventListener('change', function () {
            var file = fileInput.files[0];
            if (!file) return;

            var formData = new FormData();
            formData.append('file', file);
            status.textContent = 'Enviando...';

            fetch('/admin/upload', {
                method: 'POST',
                headers: { 'x-csrf-token': window.__CSRF_TOKEN__ },
                body: formData,
            })
                .then(function (r) {
                    return r.json().then(function (data) {
                        return { ok: r.ok, data: data };
                    });
                })
                .then(function (result) {
                    if (!result.ok) {
                        status.textContent = result.data.error || 'Erro ao enviar imagem.';
                        return;
                    }
                    hiddenInput.value = result.data.url;
                    preview.src = result.data.url;
                    preview.style.display = '';
                    status.textContent = 'Imagem enviada.';
                })
                .catch(function () {
                    status.textContent = 'Erro ao enviar imagem. Verifique sua conexão.';
                });
        });
    });

    // Repeatable text-field lists (e.g. exercise steps): + Adicionar clones
    // the last row, Remover deletes a row (always keeping at least one).
    document.querySelectorAll('[data-repeat-list]').forEach(function (list) {
        var addBtn = list.querySelector('[data-repeat-add]');

        function bindRemove(row) {
            var btn = row.querySelector('[data-repeat-remove]');
            btn.addEventListener('click', function () {
                var rows = list.querySelectorAll('[data-repeat-row]');
                if (rows.length > 1) row.remove();
            });
        }

        list.querySelectorAll('[data-repeat-row]').forEach(bindRemove);

        if (addBtn) {
            addBtn.addEventListener('click', function () {
                var rows = list.querySelectorAll('[data-repeat-row]');
                var last = rows[rows.length - 1];
                var clone = last.cloneNode(true);
                clone.querySelector('input').value = '';
                list.insertBefore(clone, addBtn);
                bindRemove(clone);
                clone.querySelector('input').focus();
            });
        }
    });

    // Reorder controls for collections (exercises list): buttons with
    // data-move="up"/"down" swap the row's position and resubmit the
    // hidden "order" field with the new sequence of ids.
    var reorderForm = document.querySelector('[data-reorder-form]');
    if (reorderForm) {
        var list = reorderForm.querySelector('[data-reorder-list]');
        var orderInput = reorderForm.querySelector('[data-reorder-value]');

        function syncOrder() {
            var ids = Array.from(list.querySelectorAll('[data-item-id]')).map(function (el) {
                return el.getAttribute('data-item-id');
            });
            orderInput.value = ids.join(',');
        }

        list.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-move]');
            if (!btn) return;
            var row = btn.closest('[data-item-id]');
            var direction = btn.getAttribute('data-move');
            if (direction === 'up' && row.previousElementSibling) {
                list.insertBefore(row, row.previousElementSibling);
            } else if (direction === 'down' && row.nextElementSibling) {
                list.insertBefore(row.nextElementSibling, row);
            }
            syncOrder();
            reorderForm.requestSubmit();
        });
    }
});
