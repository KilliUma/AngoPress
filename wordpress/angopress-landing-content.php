<?php
/**
 * Plugin Name: AngoPress Landing Content
 * Description: Gere o conteúdo da Hero e da secção Sobre directamente no painel WordPress.
 * Version:     1.0.0
 * Author:      AngoPress
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ────────────────────────────────────────────────────────────────
// CPT: angopress_news — Notícias da landing page
// ────────────────────────────────────────────────────────────────
add_action( 'init', function () {
    register_post_type( 'angopress_news', [
        'labels' => [
            'name'          => 'Notícias Landing',
            'singular_name' => 'Notícia',
            'add_new_item'  => 'Adicionar Notícia',
            'edit_item'     => 'Editar Notícia',
            'menu_name'     => 'Notícias',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => 'angopress-landing',
        'show_in_rest' => true,
        'supports'     => [ 'title', 'editor', 'thumbnail' ],
        'rewrite'      => false,
    ] );

    foreach ( [ '_news_category', '_news_read_time', '_news_url', '_news_accent' ] as $key ) {
        register_post_meta( 'angopress_news', $key, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ] );
    }
} );

add_action( 'add_meta_boxes', function () {
    add_meta_box(
        'angopress_news_details',
        'Detalhes da Notícia',
        'angopress_news_meta_box_cb',
        'angopress_news',
        'normal',
        'high'
    );
} );

function angopress_news_meta_box_cb( WP_Post $post ): void {
    wp_nonce_field( 'angopress_news_meta', 'angopress_news_nonce' );
    $category  = get_post_meta( $post->ID, '_news_category',  true ) ?: '';
    $read_time = get_post_meta( $post->ID, '_news_read_time', true ) ?: '5 min';
    $url       = get_post_meta( $post->ID, '_news_url',       true ) ?: '';
    $accent    = get_post_meta( $post->ID, '_news_accent',    true ) ?: 'brand';
    $accents   = [ 'brand' => 'Vermelho (brand)', 'blue' => 'Azul', 'violet' => 'Violeta', 'emerald' => 'Verde', 'amber' => 'Âmbar' ];
    ?>
    <table class="form-table" style="margin-top:0">
        <tr>
            <th><label for="news_category">Categoria</label></th>
            <td><input id="news_category" class="regular-text" name="news_category" value="<?= esc_attr( $category ) ?>">
            <p class="description">Ex: Plataforma, Mercado, Parceria</p></td>
        </tr>
        <tr>
            <th><label for="news_read_time">Tempo de leitura</label></th>
            <td><input id="news_read_time" class="small-text" name="news_read_time" value="<?= esc_attr( $read_time ) ?>">
            <p class="description">Ex: 4 min</p></td>
        </tr>
        <tr>
            <th><label for="news_url">URL do artigo</label></th>
            <td><input id="news_url" class="large-text" name="news_url" value="<?= esc_attr( $url ) ?>">
            <p class="description">Deixe em branco para mostrar "Em breve →".</p></td>
        </tr>
        <tr>
            <th><label for="news_accent">Cor de destaque</label></th>
            <td>
                <select id="news_accent" name="news_accent">
                    <?php foreach ( $accents as $v => $l ) : ?>
                        <option value="<?= esc_attr( $v ) ?>" <?= selected( $accent, $v, false ) ?>><?= esc_html( $l ) ?></option>
                    <?php endforeach; ?>
                </select>
            </td>
        </tr>
    </table>
    <p class="description" style="margin-top:12px;">💡 Use a <strong>imagem de destaque</strong> (painel lateral) para a fotografia do artigo. O <strong>excerto</strong> do post é usado como resumo.</p>
    <?php
}

add_action( 'save_post_angopress_news', function ( int $post_id ): void {
    if ( ! isset( $_POST['angopress_news_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['angopress_news_nonce'], 'angopress_news_meta' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    update_post_meta( $post_id, '_news_category',  sanitize_text_field( $_POST['news_category']  ?? '' ) );
    update_post_meta( $post_id, '_news_read_time', sanitize_text_field( $_POST['news_read_time'] ?? '5 min' ) );
    update_post_meta( $post_id, '_news_url',       esc_url_raw( $_POST['news_url']               ?? '' ) );
    update_post_meta( $post_id, '_news_accent',    sanitize_text_field( $_POST['news_accent']    ?? 'brand' ) );
} );

// ────────────────────────────────────────────────────────────────
// 1. Defaults
// ────────────────────────────────────────────────────────────────
function angopress_defaults(): array {
    return [
        'hero' => [
            'badge'               => 'Plataforma nº 1 de Comunicação de Imprensa em Angola',
            'headline_line1'      => 'Conecte a sua marca',
            'headline_line2'      => 'aos jornalistas certos',
            'subtitle'            => 'Crie, segmente e envie press releases para toda a imprensa angolana. Rastreie aberturas, cliques e resultados em tempo real.',
            'cta_primary_label'   => 'Começar gratuitamente',
            'cta_primary_url'     => 'https://app.angopress.ao/cadastro',
            'cta_secondary_label' => 'Ver como funciona',
            'cta_secondary_url'   => '#como-funciona',
        ],
        'about' => [
            'section_label' => 'Sobre a plataforma',
            'title'         => 'Plataforma Digital de Comunicação e Mailing de Imprensa',
            'paragraph_1'   => 'O projecto consiste no desenvolvimento de uma plataforma digital voltada para o mercado angolano, com foco em assessoria de imprensa e comunicação institucional.',
            'paragraph_2'   => 'A plataforma tem como objectivo <strong>conectar empresas, assessores de comunicação e jornalistas</strong>, permitindo a criação, gestão e envio de press releases de forma segmentada, além do acompanhamento de métricas de desempenho.',
            'paragraph_3'   => 'A solução busca resolver a falta de organização, segmentação e mensuração nos envios de comunicação para a imprensa, oferecendo uma ferramenta <strong>centralizada, eficiente e escalável</strong>.',
            'pillars'       => json_encode( [
                [ 'title' => 'Conecta',   'description' => 'Rede verificada de jornalistas e órgãos de comunicação angolanos, segmentada por área editorial.', 'accent' => 'brand' ],
                [ 'title' => 'Segmenta',  'description' => 'Envios dirigidos por área editorial, tipo de média e localização.',                              'accent' => 'violet' ],
                [ 'title' => 'Mensura',   'description' => 'Analytics de aberturas, cliques e resultados em tempo real.',                                    'accent' => 'emerald' ],
                [ 'title' => 'Escalável', 'description' => 'Planos adaptados ao crescimento de cada organização.',                                           'accent' => 'amber' ],
            ] ),
        ],
        'how_it_works' => [
            'section_label'  => 'Como funciona',
            'title'          => 'Simples, rápido e eficaz',
            'subtitle'       => 'Em apenas três passos, os seus press releases chegam aos jornalistas certos.',
            'features_title' => 'Tudo incluído, sem surpresas',
            'cta_label'      => 'Criar a minha conta grátis',
            'cta_url'        => 'https://app.angopress.ao/cadastro',
            'steps'          => json_encode( [
                [ 'title' => 'Crie o seu press release',         'description' => 'Use o nosso editor rico para escrever, formatar e anexar materiais. Guarde como rascunho e revise quando quiser.',                                               'accent' => 'brand'   ],
                [ 'title' => 'Segmente os destinatários',        'description' => 'Filtre jornalistas por cidade, editoria (economia, política, tecnologia…) e tipo de mídia (TV, rádio, digital, imprensa).',                                   'accent' => 'violet'  ],
                [ 'title' => 'Envie e acompanhe os resultados',  'description' => 'Dispare imediatamente ou agende para o melhor horário. Acompanhe aberturas, cliques e bounces em tempo real.',                                                'accent' => 'emerald' ],
            ] ),
            'features'       => json_encode( [
                [ 'title' => 'Editor de press releases',          'description' => 'Escreva e formate com um editor rico que suporta imagens, blocos de citação e pré-visualização antes do envio.',                                           'accent' => 'brand'   ],
                [ 'title' => 'Base de jornalistas angolanos',     'description' => 'Aceda a uma base curada de jornalistas de TV, rádio, imprensa escrita, media digital e podcasts em Angola.',                                             'accent' => 'blue'    ],
                [ 'title' => 'Sistema de filtros avançados',      'description' => 'Filtre por cidade, editoria (economia, política, cultura, tecnologia…) e tipo de mídia para chegar ao público certo.',                                    'accent' => 'violet'  ],
                [ 'title' => 'Analytics em tempo real',           'description' => 'Rastreie aberturas, cliques, bounces e descadastros de cada campanha com gráficos detalhados e exportação de relatório.',                                 'accent' => 'emerald' ],
                [ 'title' => 'Agendamento de campanhas',          'description' => 'Agende envios para o momento ideal — horas, dias ou semanas à frente — e maximize a taxa de abertura.',                                                  'accent' => 'amber'   ],
                [ 'title' => 'Envio em massa com personalização', 'description' => 'Envie para centenas de jornalistas de uma só vez. Cada e-mail pode ser personalizado com o nome do jornalista e veículo.',                                'accent' => 'cyan'    ],
            ] ),
        ],
        'journalist_cta' => [
            'badge'               => 'Para Jornalistas',
            'title_line1'         => 'É jornalista?',
            'title_line2'         => 'Faça parte da nossa base',
            'description'         => 'Registe-se gratuitamente e receba press releases de empresas angolanas directamente na sua caixa de entrada. O cadastro é aprovado pelo nosso administrador.',
            'secondary_cta_label' => 'Saiba mais',
            'secondary_cta_url'   => '#para-quem',
        ],
       'news' => [
            'section_label' => 'Notícias',
            'title'         => 'Últimas da AngoPress',
            'description'   => 'Novidades da plataforma, tendências do sector e dicas para uma comunicação mais eficaz.',
            'badge'         => '',
        ],
        'pricing' => [
            'section_label'       => 'Planos e Preços',
            'title'               => 'Comece hoje. Cresça ao seu ritmo.',
            'description'         => 'Todos os planos incluem acesso à plataforma e à base de jornalistas angolanos.',
            'payment_title'       => 'Pagamento simples e local',
            'payment_description' => 'Após escolher o plano, disponibilizamos o <strong>IBAN</strong> para depósito bancário e o contacto (e-mail/WhatsApp) para envio do comprovativo. O acesso é activado ou renovado após confirmação do pagamento.',
        ],
    ];
}

// ────────────────────────────────────────────────────────────────
// 2. Menu no admin
// ────────────────────────────────────────────────────────────────
add_action( 'admin_menu', function () {
    add_menu_page(
        'AngoPress Landing',
        'AngoPress Landing',
        'manage_options',
        'angopress-landing',
        'angopress_landing_page',
        'dashicons-megaphone',
        80
    );
} );

// ────────────────────────────────────────────────────────────────
// 3. Admin page
// ────────────────────────────────────────────────────────────────
function angopress_landing_page(): void {
    if ( ! current_user_can( 'manage_options' ) ) return;

    // ── Save ──
    if ( isset( $_POST['angopress_save'] ) && check_admin_referer( 'angopress_save_content' ) ) {
        $hero = [
            'badge'               => sanitize_text_field( $_POST['hero_badge']               ?? '' ),
            'headline_line1'      => sanitize_text_field( $_POST['hero_headline_line1']      ?? '' ),
            'headline_line2'      => sanitize_text_field( $_POST['hero_headline_line2']      ?? '' ),
            'subtitle'            => sanitize_textarea_field( $_POST['hero_subtitle']        ?? '' ),
            'cta_primary_label'   => sanitize_text_field( $_POST['hero_cta_primary_label']   ?? '' ),
            'cta_primary_url'     => esc_url_raw( $_POST['hero_cta_primary_url']             ?? '' ),
            'cta_secondary_label' => sanitize_text_field( $_POST['hero_cta_secondary_label'] ?? '' ),
            'cta_secondary_url'   => esc_url_raw( $_POST['hero_cta_secondary_url']           ?? '' ),
        ];
        update_option( 'angopress_hero', $hero );

        $p_titles  = array_map( 'sanitize_text_field',    $_POST['pillar_title']       ?? [] );
        $p_descs   = array_map( 'sanitize_textarea_field', $_POST['pillar_description'] ?? [] );
        $p_accents = array_map( 'sanitize_text_field',    $_POST['pillar_accent']      ?? [] );
        $pillars   = [];
        foreach ( $p_titles as $i => $t ) {
            $pillars[] = [
                'title'       => $t,
                'description' => $p_descs[ $i ]   ?? '',
                'accent'      => $p_accents[ $i ]  ?? 'brand',
            ];
        }

        $about = [
            'section_label' => sanitize_text_field( $_POST['about_section_label'] ?? '' ),
            'title'         => sanitize_text_field( $_POST['about_title']         ?? '' ),
            'paragraph_1'   => wp_kses_post( $_POST['about_paragraph_1']          ?? '' ),
            'paragraph_2'   => wp_kses_post( $_POST['about_paragraph_2']          ?? '' ),
            'paragraph_3'   => wp_kses_post( $_POST['about_paragraph_3']          ?? '' ),
            'pillars'       => json_encode( $pillars ),
        ];
        update_option( 'angopress_about', $about );

        // ── News ──
        $news_label       = sanitize_text_field( $_POST['news_section_label'] ?? '' );
        $news_title       = sanitize_text_field( $_POST['news_title']         ?? '' );
        $news_description = sanitize_textarea_field( $_POST['news_description'] ?? '' );
        $news_badge       = sanitize_text_field( $_POST['news_badge']         ?? '' );

        $a_cats    = array_map( 'sanitize_text_field',    $_POST['article_category'] ?? [] );
        $a_titles  = array_map( 'sanitize_text_field',    $_POST['article_title']    ?? [] );
        $a_excepts = array_map( 'sanitize_textarea_field', $_POST['article_excerpt']  ?? [] );
        $a_times   = array_map( 'sanitize_text_field',    $_POST['article_read_time'] ?? [] );
        $a_urls    = array_map( 'esc_url_raw',            $_POST['article_url']      ?? [] );
        $a_accents = array_map( 'sanitize_text_field',    $_POST['article_accent']   ?? [] );

        $articles = [];
        foreach ( $a_titles as $i => $t ) {
            $articles[] = [
                'category'  => $a_cats[ $i ]    ?? '',
                'title'     => $t,
                'excerpt'   => $a_excepts[ $i ] ?? '',
                'read_time' => $a_times[ $i ]   ?? '5 min',
                'url'       => $a_urls[ $i ]    ?? '',
                'accent'    => $a_accents[ $i ] ?? 'brand',
            ];
        }

        $news = [
            'section_label' => $news_label,
            'title'         => $news_title,
            'description'   => $news_description,
            'badge'         => $news_badge,
            'articles'      => json_encode( $articles ),
        ];
        update_option( 'angopress_news', $news );

        // ── How It Works ──
        $s_titles  = array_map( 'sanitize_text_field',     $_POST['step_title']       ?? [] );
        $s_descs   = array_map( 'sanitize_textarea_field', $_POST['step_description'] ?? [] );
        $s_accents = array_map( 'sanitize_text_field',     $_POST['step_accent']      ?? [] );
        $steps = [];
        foreach ( $s_titles as $i => $t ) {
            $steps[] = [
                'title'       => $t,
                'description' => $s_descs[ $i ]  ?? '',
                'accent'      => $s_accents[ $i ] ?? 'brand',
            ];
        }

        $f_titles  = array_map( 'sanitize_text_field',     $_POST['feature_title']       ?? [] );
        $f_descs   = array_map( 'sanitize_textarea_field', $_POST['feature_description'] ?? [] );
        $f_accents = array_map( 'sanitize_text_field',     $_POST['feature_accent']      ?? [] );
        $features_hiw = [];
        foreach ( $f_titles as $i => $t ) {
            $features_hiw[] = [
                'title'       => $t,
                'description' => $f_descs[ $i ]  ?? '',
                'accent'      => $f_accents[ $i ] ?? 'brand',
            ];
        }

        $how_it_works = [
            'section_label'  => sanitize_text_field( $_POST['hiw_section_label']  ?? '' ),
            'title'          => sanitize_text_field( $_POST['hiw_title']          ?? '' ),
            'subtitle'       => sanitize_textarea_field( $_POST['hiw_subtitle']   ?? '' ),
            'features_title' => sanitize_text_field( $_POST['hiw_features_title'] ?? '' ),
            'cta_label'      => sanitize_text_field( $_POST['hiw_cta_label']      ?? '' ),
            'cta_url'        => esc_url_raw( $_POST['hiw_cta_url']                ?? '' ),
            'steps'          => json_encode( $steps ),
            'features'       => json_encode( $features_hiw ),
        ];
        update_option( 'angopress_how_it_works', $how_it_works );

        // ── Journalist CTA ──
        $journalist_cta = [
            'badge'               => sanitize_text_field( $_POST['jcta_badge']               ?? '' ),
            'title_line1'         => sanitize_text_field( $_POST['jcta_title_line1']         ?? '' ),
            'title_line2'         => sanitize_text_field( $_POST['jcta_title_line2']         ?? '' ),
            'description'         => sanitize_textarea_field( $_POST['jcta_description']     ?? '' ),
            'secondary_cta_label' => sanitize_text_field( $_POST['jcta_secondary_cta_label'] ?? '' ),
            'secondary_cta_url'   => esc_url_raw( $_POST['jcta_secondary_cta_url']           ?? '' ),
        ];
        update_option( 'angopress_journalist_cta', $journalist_cta );

        // ── Pricing ──
        $pricing = [
            'section_label'       => sanitize_text_field( $_POST['pricing_section_label']          ?? '' ),
            'title'               => sanitize_text_field( $_POST['pricing_title']                  ?? '' ),
            'description'         => sanitize_textarea_field( $_POST['pricing_description']        ?? '' ),
            'payment_title'       => sanitize_text_field( $_POST['pricing_payment_title']          ?? '' ),
            'payment_description' => wp_kses_post( $_POST['pricing_payment_description']           ?? '' ),
        ];
        update_option( 'angopress_pricing', $pricing );

        echo '<div class="notice notice-success is-dismissible"><p>✅ Conteúdo guardado com sucesso.</p></div>';
    }

    // ── Load ──
    $d      = angopress_defaults();
    $hero   = get_option( 'angopress_hero',  $d['hero'] );
    $about  = get_option( 'angopress_about', $d['about'] );
    $news   = get_option( 'angopress_news',  $d['news'] );

    $pillars_raw = $about['pillars'] ?? $d['about']['pillars'];
    $pillars     = json_decode( $pillars_raw, true );
    if ( ! is_array( $pillars ) ) {
        $pillars = json_decode( $d['about']['pillars'], true );
    }

    $articles_raw = $news['articles'] ?? $d['news']['articles'];
    $articles     = json_decode( $articles_raw, true );
    if ( ! is_array( $articles ) ) {
        $articles = json_decode( $d['news']['articles'], true );
    }

    $hiw            = get_option( 'angopress_how_it_works',   $d['how_it_works'] );
    $journalist_cta = get_option( 'angopress_journalist_cta', $d['journalist_cta'] );

    $steps_raw = $hiw['steps'] ?? $d['how_it_works']['steps'];
    $steps     = json_decode( $steps_raw, true );
    if ( ! is_array( $steps ) ) $steps = json_decode( $d['how_it_works']['steps'], true );

    $features_raw = $hiw['features'] ?? $d['how_it_works']['features'];
    $features_hiw = json_decode( $features_raw, true );
    if ( ! is_array( $features_hiw ) ) $features_hiw = json_decode( $d['how_it_works']['features'], true );

    $accent_options      = [ 'brand' => 'Vermelho (brand)', 'violet' => 'Violeta', 'emerald' => 'Verde', 'amber' => 'Âmbar', 'blue' => 'Azul', 'cyan' => 'Ciano' ];
    $step_accent_options = [ 'brand' => 'Vermelho (brand)', 'violet' => 'Violeta', 'emerald' => 'Verde' ];
    $pricing             = get_option( 'angopress_pricing', $d['pricing'] );
    ?>
    <div class="wrap">
    <h1 style="display:flex;align-items:center;gap:8px;">
        <span class="dashicons dashicons-megaphone" style="font-size:28px;"></span>
        AngoPress — Conteúdo da Landing Page
    </h1>
    <p class="description">As alterações ficam disponíveis no site em até 5 minutos (cache de 300s).</p>

    <form method="post" style="margin-top:24px;">
        <?php wp_nonce_field( 'angopress_save_content' ); ?>

        <!-- ── HERO ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">🦸 Secção Hero</h2>
        <table class="form-table">
            <tr>
                <th><label for="hero_badge">Badge / Status</label></th>
                <td><input id="hero_badge" class="large-text" name="hero_badge" value="<?= esc_attr( $hero['badge'] ) ?>">
                <p class="description">Texto da etiqueta no topo da hero (ex: "Plataforma nº 1 …")</p></td>
            </tr>
            <tr>
                <th><label>Título — linha 1</label></th>
                <td><input class="large-text" name="hero_headline_line1" value="<?= esc_attr( $hero['headline_line1'] ) ?>">
                <p class="description">Texto branco.</p></td>
            </tr>
            <tr>
                <th><label>Título — linha 2 (gradiente)</label></th>
                <td><input class="large-text" name="hero_headline_line2" value="<?= esc_attr( $hero['headline_line2'] ) ?>">
                <p class="description">Texto com gradiente vermelho.</p></td>
            </tr>
            <tr>
                <th><label>Subtítulo</label></th>
                <td><textarea class="large-text" rows="3" name="hero_subtitle"><?= esc_textarea( $hero['subtitle'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>CTA Principal — Texto</label></th>
                <td><input class="regular-text" name="hero_cta_primary_label" value="<?= esc_attr( $hero['cta_primary_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>CTA Principal — URL</label></th>
                <td><input class="large-text" name="hero_cta_primary_url" value="<?= esc_attr( $hero['cta_primary_url'] ) ?>">
                <p class="description">URL completo ou âncora (ex: https://app.angopress.ao/cadastro)</p></td>
            </tr>
            <tr>
                <th><label>CTA Secundário — Texto</label></th>
                <td><input class="regular-text" name="hero_cta_secondary_label" value="<?= esc_attr( $hero['cta_secondary_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>CTA Secundário — URL</label></th>
                <td><input class="regular-text" name="hero_cta_secondary_url" value="<?= esc_attr( $hero['cta_secondary_url'] ) ?>">
                <p class="description">Pode ser uma âncora: #como-funciona</p></td>
            </tr>
        </table>

        <!-- ── ABOUT ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">ℹ️ Secção "Sobre a Plataforma"</h2>
        <table class="form-table">
            <tr>
                <th><label>Label da secção</label></th>
                <td><input class="regular-text" name="about_section_label" value="<?= esc_attr( $about['section_label'] ) ?>">
                <p class="description">Texto pequeno acima do título (ex: "Sobre a plataforma")</p></td>
            </tr>
            <tr>
                <th><label>Título principal</label></th>
                <td><input class="large-text" name="about_title" value="<?= esc_attr( $about['title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Parágrafo 1</label></th>
                <td><textarea class="large-text" rows="3" name="about_paragraph_1"><?= esc_textarea( $about['paragraph_1'] ) ?></textarea>
                <p class="description">Suporta HTML básico (&lt;strong&gt;, &lt;em&gt;, &lt;a&gt;).</p></td>
            </tr>
            <tr>
                <th><label>Parágrafo 2</label></th>
                <td><textarea class="large-text" rows="3" name="about_paragraph_2"><?= esc_textarea( $about['paragraph_2'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>Parágrafo 3</label></th>
                <td><textarea class="large-text" rows="3" name="about_paragraph_3"><?= esc_textarea( $about['paragraph_3'] ) ?></textarea></td>
            </tr>
        </table>

        <!-- ── PILLARS ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">🃏 Cards de Funcionalidades</h2>
        <table class="form-table">
            <?php foreach ( (array) $pillars as $i => $p ) : ?>
            <tr>
                <th>Card <?= $i + 1 ?></th>
                <td style="display:flex;flex-direction:column;gap:8px;">
                    <input placeholder="Título" class="regular-text" name="pillar_title[]" value="<?= esc_attr( $p['title'] ?? '' ) ?>">
                    <textarea placeholder="Descrição" class="large-text" rows="2" name="pillar_description[]"><?= esc_textarea( $p['description'] ?? '' ) ?></textarea>
                    <select name="pillar_accent[]">
                        <?php foreach ( $accent_options as $val => $label ) : ?>
                            <option value="<?= esc_attr( $val ) ?>" <?= selected( $p['accent'] ?? 'brand', $val, false ) ?>><?= esc_html( $label ) ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>

        <!-- ── NEWS ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">📰 Secção "Notícias"</h2>
        <table class="form-table">
            <tr>
                <th><label>Label da secção</label></th>
                <td><input class="regular-text" name="news_section_label" value="<?= esc_attr( $news['section_label'] ) ?>">
                <p class="description">Texto pequeno acima do título (ex: "Notícias")</p></td>
            </tr>
            <tr>
                <th><label>Título</label></th>
                <td><input class="large-text" name="news_title" value="<?= esc_attr( $news['title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Descrição</label></th>
                <td><textarea class="large-text" rows="2" name="news_description"><?= esc_textarea( $news['description'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>Badge</label></th>
                <td><input class="large-text" name="news_badge" value="<?= esc_attr( $news['badge'] ) ?>">
                <p class="description">Etiqueta exibida ao lado do título (ex: "Em breve — integração com blog"). Deixe em branco para ocultar.</p></td>
            </tr>
        </table>

        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">📄 Artigos de Notícias (máx. 3)</h2>
        <table class="form-table">
            <?php foreach ( (array) $articles as $i => $a ) : ?>
            <tr>
                <th>Artigo <?= $i + 1 ?></th>
                <td style="display:flex;flex-direction:column;gap:8px;">
                    <input placeholder="Categoria (ex: Plataforma)" class="regular-text" name="article_category[]" value="<?= esc_attr( $a['category'] ?? '' ) ?>">
                    <input placeholder="Título" class="large-text" name="article_title[]" value="<?= esc_attr( $a['title'] ?? '' ) ?>">
                    <textarea placeholder="Resumo / Excerpt" class="large-text" rows="2" name="article_excerpt[]"><?= esc_textarea( $a['excerpt'] ?? '' ) ?></textarea>
                    <input placeholder="Tempo de leitura (ex: 4 min)" class="small-text" name="article_read_time[]" value="<?= esc_attr( $a['read_time'] ?? '5 min' ) ?>">
                    <input placeholder="URL do artigo (opcional)" class="large-text" name="article_url[]" value="<?= esc_attr( $a['url'] ?? '' ) ?>">
                    <select name="article_accent[]">
                        <?php foreach ( $accent_options as $val => $label ) : ?>
                            <option value="<?= esc_attr( $val ) ?>" <?= selected( $a['accent'] ?? 'brand', $val, false ) ?>><?= esc_html( $label ) ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>

        <!-- ── HOW IT WORKS ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">⚙️ Secção "Como Funciona"</h2>
        <table class="form-table">
            <tr>
                <th><label>Label da secção</label></th>
                <td><input class="regular-text" name="hiw_section_label" value="<?= esc_attr( $hiw['section_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Título</label></th>
                <td><input class="large-text" name="hiw_title" value="<?= esc_attr( $hiw['title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Subtítulo</label></th>
                <td><textarea class="large-text" rows="2" name="hiw_subtitle"><?= esc_textarea( $hiw['subtitle'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>Título das funcionalidades</label></th>
                <td><input class="large-text" name="hiw_features_title" value="<?= esc_attr( $hiw['features_title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Botão CTA — Texto</label></th>
                <td><input class="regular-text" name="hiw_cta_label" value="<?= esc_attr( $hiw['cta_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Botão CTA — URL</label></th>
                <td><input class="large-text" name="hiw_cta_url" value="<?= esc_attr( $hiw['cta_url'] ) ?>"></td>
            </tr>
        </table>

        <h3 style="padding-left:10px;">🔢 Passos (máx. 3)</h3>
        <table class="form-table">
            <?php foreach ( (array) $steps as $i => $s ) : ?>
            <tr>
                <th>Passo <?= $i + 1 ?></th>
                <td style="display:flex;flex-direction:column;gap:8px;">
                    <input placeholder="Título" class="large-text" name="step_title[]" value="<?= esc_attr( $s['title'] ?? '' ) ?>">
                    <textarea placeholder="Descrição" class="large-text" rows="2" name="step_description[]"><?= esc_textarea( $s['description'] ?? '' ) ?></textarea>
                    <select name="step_accent[]">
                        <?php foreach ( $step_accent_options as $val => $label ) : ?>
                            <option value="<?= esc_attr( $val ) ?>" <?= selected( $s['accent'] ?? 'brand', $val, false ) ?>><?= esc_html( $label ) ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>

        <h3 style="padding-left:10px;">🧩 Funcionalidades (máx. 6)</h3>
        <table class="form-table">
            <?php foreach ( (array) $features_hiw as $i => $f ) : ?>
            <tr>
                <th>Feature <?= $i + 1 ?></th>
                <td style="display:flex;flex-direction:column;gap:8px;">
                    <input placeholder="Título" class="large-text" name="feature_title[]" value="<?= esc_attr( $f['title'] ?? '' ) ?>">
                    <textarea placeholder="Descrição" class="large-text" rows="2" name="feature_description[]"><?= esc_textarea( $f['description'] ?? '' ) ?></textarea>
                    <select name="feature_accent[]">
                        <?php foreach ( $accent_options as $val => $label ) : ?>
                            <option value="<?= esc_attr( $val ) ?>" <?= selected( $f['accent'] ?? 'brand', $val, false ) ?>><?= esc_html( $label ) ?></option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>

        <!-- ── JOURNALIST CTA ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">🎤 CTA "É Jornalista?"</h2>
        <table class="form-table">
            <tr>
                <th><label>Badge</label></th>
                <td><input class="regular-text" name="jcta_badge" value="<?= esc_attr( $journalist_cta['badge'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Título — linha 1</label></th>
                <td><input class="large-text" name="jcta_title_line1" value="<?= esc_attr( $journalist_cta['title_line1'] ) ?>">
                <p class="description">Texto branco (ex: "É jornalista?")</p></td>
            </tr>
            <tr>
                <th><label>Título — linha 2 (gradiente)</label></th>
                <td><input class="large-text" name="jcta_title_line2" value="<?= esc_attr( $journalist_cta['title_line2'] ) ?>">
                <p class="description">Texto com gradiente vermelho.</p></td>
            </tr>
            <tr>
                <th><label>Descrição</label></th>
                <td><textarea class="large-text" rows="3" name="jcta_description"><?= esc_textarea( $journalist_cta['description'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>Link secundário — Texto</label></th>
                <td><input class="regular-text" name="jcta_secondary_cta_label" value="<?= esc_attr( $journalist_cta['secondary_cta_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Link secundário — URL</label></th>
                <td><input class="regular-text" name="jcta_secondary_cta_url" value="<?= esc_attr( $journalist_cta['secondary_cta_url'] ) ?>">
                <p class="description">Pode ser uma âncora: #para-quem</p></td>
            </tr>
        </table>

        <!-- ── PRICING ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">💳 Secção "Planos e Preços"</h2>
        <table class="form-table">
            <tr>
                <th><label>Label da secção</label></th>
                <td><input class="regular-text" name="pricing_section_label" value="<?= esc_attr( $pricing['section_label'] ) ?>">
                <p class="description">Texto pequeno acima do título (ex: "Planos e Preços")</p></td>
            </tr>
            <tr>
                <th><label>Título</label></th>
                <td><input class="large-text" name="pricing_title" value="<?= esc_attr( $pricing['title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Descrição</label></th>
                <td><textarea class="large-text" rows="2" name="pricing_description"><?= esc_textarea( $pricing['description'] ) ?></textarea></td>
            </tr>
            <tr>
                <th><label>Caixa de pagamento — Título</label></th>
                <td><input class="large-text" name="pricing_payment_title" value="<?= esc_attr( $pricing['payment_title'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Caixa de pagamento — Texto</label></th>
                <td><textarea class="large-text" rows="4" name="pricing_payment_description"><?= esc_textarea( $pricing['payment_description'] ) ?></textarea>
                <p class="description">Suporta HTML básico (&lt;strong&gt;, &lt;a&gt;).</p></td>
            </tr>
        </table>

        <?php submit_button( 'Guardar conteúdo', 'primary large', 'angopress_save' ); ?>
    </form>
    </div>
    <?php
}

// ────────────────────────────────────────────────────────────────
// Helper: serializa um post CPT angopress_news para array REST
// ────────────────────────────────────────────────────────────────
function angopress_serialize_article( WP_Post $p, string $size = 'medium_large' ): array {
    $img = '';
    if ( has_post_thumbnail( $p->ID ) ) {
        $img = (string) get_the_post_thumbnail_url( $p->ID, $size );
    }
    return [
        'slug'         => $p->post_name,
        'title'        => $p->post_title,
        'category'     => get_post_meta( $p->ID, '_news_category',  true ) ?: '',
        'excerpt'      => $p->post_excerpt ?: wp_trim_words( $p->post_content, 25, '…' ),
        'read_time'    => get_post_meta( $p->ID, '_news_read_time', true ) ?: '5 min',
        'url'          => get_post_meta( $p->ID, '_news_url',       true ) ?: '',
        'accent'       => get_post_meta( $p->ID, '_news_accent',    true ) ?: 'brand',
        'image_url'    => $img,
        'published_at' => get_the_date( 'c', $p ),
    ];
}

// ────────────────────────────────────────────────────────────────
// 4. REST endpoint  GET /wp-json/angopress/v1/landing
// ────────────────────────────────────────────────────────────────
add_action( 'rest_api_init', function () {
    register_rest_route( 'angopress/v1', '/landing', [
        'methods'             => 'GET',
        'callback'            => function () {
            $d     = angopress_defaults();
            $hero  = get_option( 'angopress_hero',  $d['hero'] );
            $about = get_option( 'angopress_about', $d['about'] );
            $news  = get_option( 'angopress_news',  $d['news'] );

            $pillars_raw = $about['pillars'] ?? $d['about']['pillars'];
            $pillars     = json_decode( $pillars_raw, true );
            if ( ! is_array( $pillars ) ) {
                $pillars = json_decode( $d['about']['pillars'], true );
            }
            $about['pillars'] = $pillars;

            // Artigos: preferir CPT angopress_news (com imagem de destaque)
            $cpt_posts = get_posts( [
                'post_type'      => 'angopress_news',
                'post_status'    => 'publish',
                'posts_per_page' => 3,
                'orderby'        => 'menu_order date',
                'order'          => 'ASC',
            ] );

            if ( count( $cpt_posts ) > 0 ) {
                $cpt_articles = [];
                foreach ( $cpt_posts as $post ) {
                    $image_url = '';
                    if ( has_post_thumbnail( $post->ID ) ) {
                        $image_url = (string) get_the_post_thumbnail_url( $post->ID, 'medium_large' );
                    }
                    $cpt_articles[] = [
                        'slug'         => $post->post_name,
                        'category'     => get_post_meta( $post->ID, '_news_category',  true ) ?: '',
                        'title'        => $post->post_title,
                        'excerpt'      => $post->post_content ?: wp_trim_words( $post->post_content, 25, '…' ),
                        'read_time'    => get_post_meta( $post->ID, '_news_read_time', true ) ?: '5 min',
                        'url'          => get_post_meta( $post->ID, '_news_url',       true ) ?: '',
                        'accent'       => get_post_meta( $post->ID, '_news_accent',    true ) ?: 'brand',
                        'image_url'    => $image_url,
                        'published_at' => get_the_date( 'c', $post ),
                    ];
                }
                $news['articles'] = $cpt_articles;
            } else {
                // Fallback: artigos manuais guardados em wp_options
                $articles_raw     = $news['articles'] ?? '[]';
                $manual_articles  = json_decode( $articles_raw, true );
                $news['articles'] = is_array( $manual_articles ) ? $manual_articles : [];
            }

            $hiw_opt  = get_option( 'angopress_how_it_works',   $d['how_it_works'] );
            $jcta_opt = get_option( 'angopress_journalist_cta', $d['journalist_cta'] );
            $pr_opt   = get_option( 'angopress_pricing',        $d['pricing'] );

            $steps_r = $hiw_opt['steps'] ?? $d['how_it_works']['steps'];
            $steps_a = json_decode( $steps_r, true );
            if ( ! is_array( $steps_a ) ) $steps_a = json_decode( $d['how_it_works']['steps'], true );
            $hiw_opt['steps'] = $steps_a;

            $feat_r = $hiw_opt['features'] ?? $d['how_it_works']['features'];
            $feat_a = json_decode( $feat_r, true );
            if ( ! is_array( $feat_a ) ) $feat_a = json_decode( $d['how_it_works']['features'], true );
            $hiw_opt['features'] = $feat_a;

            return rest_ensure_response( [
                'hero'           => $hero,
                'about'          => $about,
                'news'           => $news,
                'how_it_works'   => $hiw_opt,
                'journalist_cta' => $jcta_opt,
                'pricing'        => $pr_opt,
            ] );
        },
        'permission_callback' => '__return_true',
    ] );

    // ────────────────────────────────────────────────────────────
    // GET /wp-json/angopress/v1/news/{slug}  — artigo individual
    // ────────────────────────────────────────────────────────────
    register_rest_route( 'angopress/v1', '/news/(?P<slug>[a-z0-9\-]+)', [
        'methods'             => 'GET',
        'callback'            => function ( WP_REST_Request $request ) {
            $slug = sanitize_title( $request->get_param( 'slug' ) );
            $posts = get_posts( [
                'post_type'   => 'angopress_news',
                'post_status' => 'publish',
                'name'        => $slug,
                'numberposts' => 1,
            ] );
            if ( empty( $posts ) ) {
                return new WP_Error( 'not_found', 'Artigo não encontrado.', [ 'status' => 404 ] );
            }
            $post = $posts[0];

            // Imagem grande para o hero
            $image_url = '';
            if ( has_post_thumbnail( $post->ID ) ) {
                $image_url = (string) get_the_post_thumbnail_url( $post->ID, 'large' );
            }

            // ── Artigo anterior (mais antigo)
            $prev_posts = get_posts( [
                'post_type'   => 'angopress_news',
                'post_status' => 'publish',
                'numberposts' => 1,
                'orderby'     => 'date',
                'order'       => 'DESC',
                'date_query'  => [ [ 'before' => $post->post_date, 'inclusive' => false ] ],
            ] );
            $prev = ! empty( $prev_posts ) ? angopress_serialize_article( $prev_posts[0] ) : null;

            // ── Próximo artigo (mais recente)
            $next_posts = get_posts( [
                'post_type'   => 'angopress_news',
                'post_status' => 'publish',
                'numberposts' => 1,
                'orderby'     => 'date',
                'order'       => 'ASC',
                'date_query'  => [ [ 'after' => $post->post_date, 'inclusive' => false ] ],
            ] );
            $next = ! empty( $next_posts ) ? angopress_serialize_article( $next_posts[0] ) : null;

            // ── Artigos relacionados (mesma categoria)
            $category    = get_post_meta( $post->ID, '_news_category', true ) ?: '';
            $rel_args    = [
                'post_type'   => 'angopress_news',
                'post_status' => 'publish',
                'numberposts' => 3,
                'orderby'     => 'date',
                'order'       => 'DESC',
                'exclude'     => [ $post->ID ],
            ];
            if ( $category ) {
                $rel_args['meta_query'] = [ [ 'key' => '_news_category', 'value' => $category, 'compare' => '=' ] ];
            }
            $related = array_map( 'angopress_serialize_article', get_posts( $rel_args ) );

            // ── Notícias recentes (sidebar)
            $recent = array_map( 'angopress_serialize_article', get_posts( [
                'post_type'   => 'angopress_news',
                'post_status' => 'publish',
                'numberposts' => 5,
                'orderby'     => 'date',
                'order'       => 'DESC',
                'exclude'     => [ $post->ID ],
            ] ) );

            return rest_ensure_response( [
                'slug'         => $post->post_name,
                'title'        => $post->post_title,
                'category'     => $category,
                'excerpt'      => $post->post_excerpt ?: '',
                'content'      => wpautop( $post->post_content ),
                'read_time'    => get_post_meta( $post->ID, '_news_read_time', true ) ?: '5 min',
                'url'          => get_post_meta( $post->ID, '_news_url',       true ) ?: '',
                'accent'       => get_post_meta( $post->ID, '_news_accent',    true ) ?: 'brand',
                'image_url'    => $image_url,
                'published_at' => get_the_date( 'c', $post ),
                'prev'         => $prev,
                'next'         => $next,
                'related'      => $related,
                'recent'       => $recent,
            ] );
        },
        'permission_callback' => '__return_true',
        'args'                => [
            'slug' => [ 'required' => true, 'sanitize_callback' => 'sanitize_title' ],
        ],
    ] );

    // ────────────────────────────────────────────────────────────
    // GET /wp-json/angopress/v1/news  — listagem completa
    // ────────────────────────────────────────────────────────────
    register_rest_route( 'angopress/v1', '/news', [
        'methods'             => 'GET',
        'callback'            => function ( WP_REST_Request $request ) {
            $per_page = (int) ( $request->get_param( 'per_page' ) ?? 12 );
            $page     = (int) ( $request->get_param( 'page' )     ?? 1  );
            $per_page = min( max( $per_page, 1 ), 50 );
            $page     = max( $page, 1 );

            $query = new WP_Query( [
                'post_type'      => 'angopress_news',
                'post_status'    => 'publish',
                'posts_per_page' => $per_page,
                'paged'          => $page,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ] );

            $articles = [];
            foreach ( $query->posts as $post ) {
                $image_url = '';
                if ( has_post_thumbnail( $post->ID ) ) {
                    $image_url = (string) get_the_post_thumbnail_url( $post->ID, 'medium_large' );
                }
                $articles[] = [
                    'slug'         => $post->post_name,
                    'title'        => $post->post_title,
                    'category'     => get_post_meta( $post->ID, '_news_category',  true ) ?: '',
                    'excerpt'      => $post->post_excerpt ?: wp_trim_words( $post->post_content, 25, '…' ),
                    'read_time'    => get_post_meta( $post->ID, '_news_read_time', true ) ?: '5 min',
                    'url'          => get_post_meta( $post->ID, '_news_url',       true ) ?: '',
                    'accent'       => get_post_meta( $post->ID, '_news_accent',    true ) ?: 'brand',
                    'image_url'    => $image_url,
                    'published_at' => get_the_date( 'c', $post ),
                ];
            }

            return rest_ensure_response( [
                'articles'   => $articles,
                'total'      => (int) $query->found_posts,
                'total_pages' => (int) $query->max_num_pages,
                'page'       => $page,
                'per_page'   => $per_page,
            ] );
        },
        'permission_callback' => '__return_true',
        'args' => [
            'per_page' => [ 'default' => 12, 'sanitize_callback' => 'absint' ],
            'page'     => [ 'default' => 1,  'sanitize_callback' => 'absint' ],
        ],
    ] );
} );
