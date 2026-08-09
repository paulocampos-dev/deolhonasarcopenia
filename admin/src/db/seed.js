// One-time seed: populates the DB with the site's current live copy so the
// first render produced by the new templates is a no-op vs. the old
// hand-authored HTML. Safe to re-run - it only inserts rows that don't exist.
require('dotenv').config();
const db = require('./index');

function seedSettings() {
    if (db.getSettings()) return;
    db.saveSettingsDraft({
        brandText: 'De Olho Na Sarcopenia',
        footerOrgLine: 'USP Iniciativa de Saúde',
        contactEmail: 'contato@deolhonasarcopenia.com.br',
        instagramUrl: 'https://instagram.com/deolhonasarcopenia',
        instagramLabel: 'Instagram',
        logoImage: null,
        textScale: 'normal',
    });
    db.publishSettings();
    console.log('Seeded: settings');
}

function seedPage(key, fields) {
    if (db.getPage(key)) return;
    db.savePageDraft(key, fields);
    db.publishPage(key);
    console.log(`Seeded: page "${key}"`);
}

function seedPages() {
    seedPage('home', {
        eyebrow: 'Iniciativa USP',
        h1Prefix: 'O que é a',
        h1Highlight: 'Sarcopenia?',
        heroParagraph:
            'Entenda como a perda de massa muscular afeta o envelhecimento e descubra práticas baseadas em evidências para manter sua força, independência e qualidade de vida.',
        heroImage: '/assets/img/home-hero.png',
        heroImageAlt: 'Idoso ativo se exercitando em um estúdio iluminado',
        ctaPrimaryLabel: 'Ver Exercícios',
        ctaSecondaryLabel: 'Fale Conosco',
        badgeTitle: 'Baseado em Evidências',
        badgeSubtitle: 'Metodologia validada pela USP',
        aboutHeading: 'Nossa Missão Científica',
        aboutParagraph1:
            'Nascido nos laboratórios da Faculdade de Medicina da USP, o projeto "De Olho Na Sarcopenia" tem como objetivo democratizar o acesso à informação científica de qualidade sobre a saúde muscular no envelhecimento.',
        aboutParagraph2:
            'Traduzimos pesquisas complexas em diretrizes práticas e seguras para o dia a dia, capacitando idosos, familiares e cuidadores a tomarem decisões informadas sobre exercícios físicos e nutrição adequada para prevenir e tratar a sarcopenia.',
        aboutImage: '/assets/img/home-about.png',
        aboutImageAlt: 'Pesquisadores da USP analisando dados em laboratório',
        helpHeading: 'Como podemos ajudar?',
        helpSubheading:
            'Navegue pelas nossas ferramentas e recursos desenvolvidos por especialistas para apoiar sua jornada de saúde muscular.',
        card1Title: 'Saiba mais sobre a Sarcopenia',
        card1Description:
            'Artigos revisados por pares, cartilhas explicativas e vídeos detalhando causas, sintomas e tratamentos.',
        card1Cta: 'Acessar Biblioteca',
        card2Title: 'Comece a se exercitar',
        card2Description:
            'Programas de treinamento resistido seguros, desenvolvidos especificamente para diferentes níveis de mobilidade e força na terceira idade.',
        card2Cta: 'Ver Programas',
        card3Title: 'Fale Conosco',
        card3Description:
            'Dúvidas sobre o projeto ou precisa de indicação de profissionais especializados? Entre em contato com nossa equipe clínica.',
        card3Cta: 'Enviar Mensagem',
    });

    seedPage('exercicios', {
        heading: 'Exercícios Recomendados',
        warningText:
            'Antes de iniciar qualquer programa de exercícios, consulte um médico ou fisioterapeuta para garantir que estas atividades são seguras para o seu perfil e condição de saúde.',
    });

    seedPage('blog', {
        heading: 'Nosso Blog',
        subheading:
            'Informações confiáveis, dicas de saúde e opiniões de especialistas sobre a Sarcopenia e como manter sua qualidade de vida.',
    });

    seedPage('contato', {
        heading: 'Fale Conosco',
        introParagraph:
            'Estamos aqui para ajudar! Se você tem dúvidas sobre o projeto "De Olho na Sarcopenia", deseja compartilhar sua história ou precisa de mais informações sobre prevenção e exercícios, envie-nos uma mensagem.',
        decorativeImage: '/assets/img/contato-illustration.jpg',
        decorativeImageAlt: 'Ilustração de um idoso sorridente usando um smartphone',
    });
}

function seedExercises() {
    if (db.listExercises().length > 0) return;

    const items = [
        {
            title: 'Caminhada Assistida',
            image: '/assets/img/exercicios-caminhada.jpg',
            imageAlt: 'Idoso caminhando em um parque com apoio de um cuidador',
            itemsLabel: 'Itens Recomendados:',
            itemsIcon: 'directions_walk',
            steps: [
                'Encontre um local plano e seguro, livre de obstáculos.',
                'Utilize seu apoio (bengala ou andador) se recomendado.',
                'Caminhe em ritmo confortável por 10 a 15 minutos, focando na respiração.',
            ],
        },
        {
            title: 'Agachamento na Cadeira',
            image: '/assets/img/exercicios-agachamento.jpg',
            imageAlt: 'Idosa realizando agachamento apoiada em uma cadeira na sala de estar',
            itemsLabel: 'Itens Recomendados:',
            itemsIcon: 'chair',
            steps: [
                'Sente-se na ponta de uma cadeira firme com os pés apoiados no chão.',
                'Incline-se ligeiramente para frente e levante-se devagar.',
                'Sente-se novamente de forma controlada. Repita 8 a 10 vezes.',
            ],
        },
    ];

    for (const fields of items) {
        const id = db.createExercise(fields);
        db.publishExercise(id);
    }
    console.log('Seeded: exercises (2)');
}

function seedPosts() {
    if (db.listPosts().length > 0) return;

    const posts = [
        {
            slug: 'o-que-voce-vai-encontrar-por-aqui',
            date: '2026-08-05',
            title: 'O que você vai encontrar por aqui?',
            coverImage: '/assets/img/blog-featured.jpg',
            coverImageAlt: 'Casal de idosos caminhando em um parque em um dia ensolarado',
            excerpt:
                'Conheça o Projeto "De Olho na Sarcopenia"! Somos uma iniciativa da USP dedicada a levar informação e conscientização sobre a perda de massa e força muscular...',
            bodyHtml:
                '<p>Conheça o Projeto "De Olho na Sarcopenia"! Somos uma iniciativa da USP dedicada a levar informação e conscientização sobre a perda de massa e força muscular para idosos, familiares e cuidadores.</p><p>Aqui você vai encontrar artigos revisados por especialistas, entrevistas, dicas práticas de exercícios e informações sobre como acessar cuidado de qualidade pelo SUS.</p>',
        },
        {
            slug: 'exercicios-em-casa-quando-fazer',
            date: '2026-07-28',
            title: 'Exercícios em Casa: Quando Fazer?',
            coverImage: '/assets/img/blog-post-exercicios-casa.jpg',
            coverImageAlt: 'Idoso fazendo exercícios leves com halteres em casa',
            excerpt:
                'Após diagnóstico ou suspeita de sarcopenia, o ideal é começar a praticar exercícios na rotina. Mas como adaptar sua casa com segurança?',
            bodyHtml:
                '<p>Após diagnóstico ou suspeita de sarcopenia, o ideal é começar a praticar exercícios na rotina. Mas como adaptar sua casa com segurança?</p><p>Neste artigo, reunimos recomendações práticas para transformar qualquer cômodo em um espaço seguro para o treino.</p>',
        },
        {
            slug: 'entrevista-com-dra-sumika-mori',
            date: '2026-07-15',
            title: 'Entrevista com Dra. Sumika Mori',
            coverImage: '/assets/img/blog-post-entrevista.jpg',
            coverImageAlt: 'Médica conversando por videochamada com um paciente idoso',
            excerpt:
                "Nesta entrevista exclusiva, abordamos quais as 'red flags' para investigar a sarcopenia e a relação com outras comorbidades.",
            bodyHtml:
                "<p>Nesta entrevista exclusiva, abordamos quais as 'red flags' para investigar a sarcopenia e a relação com outras comorbidades.</p>",
        },
        {
            slug: 'como-incluir-exercicios-fisicos-na-rotina',
            date: '2026-07-02',
            title: 'Como incluir exercícios físicos na rotina?',
            coverImage: '/assets/img/blog-post-rotina.jpg',
            coverImageAlt: 'Ilustração de um calendário com uma lista de tarefas marcada',
            excerpt:
                'Manter a constância na prática de exercícios físicos pode ser desafiador. Dificuldade em encaixar no dia a dia é o principal motivo.',
            bodyHtml:
                '<p>Manter a constância na prática de exercícios físicos pode ser desafiador. Dificuldade em encaixar no dia a dia é o principal motivo.</p>',
        },
        {
            slug: 'voce-sabe-o-que-e-fraqueza-adquirida-na-uti',
            date: '2026-06-20',
            title: 'Você sabe o que é fraqueza adquirida na UTI?',
            coverImage: '/assets/img/blog-post-uti.jpg',
            coverImageAlt: 'Paciente idoso internado se recuperando em um leito hospitalar',
            excerpt:
                'Entenda os impactos da fraqueza adquirida durante internações prolongadas e como identificar os sinais precocemente.',
            bodyHtml:
                '<p>Entenda os impactos da fraqueza adquirida durante internações prolongadas e como identificar os sinais precocemente.</p>',
        },
        {
            slug: 'e-possivel-cuidar-da-sarcopenia-pelo-sus',
            date: '2026-06-10',
            title: 'É possível cuidar da sarcopenia pelo SUS?',
            coverImage: '/assets/img/blog-post-sus.jpg',
            coverImageAlt: 'Ilustração de uma Unidade Básica de Saúde acolhedora',
            excerpt:
                'O primeiro passo é encontrar a "Unidade Básica de Saúde" mais próxima da sua casa e marcar uma consulta com a equipe multiprofissional.',
            bodyHtml:
                '<p>O primeiro passo é encontrar a "Unidade Básica de Saúde" mais próxima da sua casa e marcar uma consulta com a equipe multiprofissional.</p>',
        },
    ];

    for (const { slug, date, ...fields } of posts) {
        const id = db.createPost(slug, { ...fields, author: 'Equipe De Olho Na Sarcopenia', date });
        db.publishPost(id);
    }
    console.log(`Seeded: posts (${posts.length})`);
}

function seedAdminUser() {
    const username = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!username || !passwordHash) {
        console.log('Skipped: admin user (ADMIN_USERNAME/ADMIN_PASSWORD_HASH not set)');
        return;
    }
    db.ensureAdminUser(username, passwordHash);
    console.log(`Seeded: admin user "${username}" (if not already present)`);
}

seedSettings();
seedPages();
seedExercises();
seedPosts();
seedAdminUser();
console.log('Seed complete.');
