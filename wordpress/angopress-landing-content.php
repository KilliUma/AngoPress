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

    // Regista explicitamente o submenu "principal" para evitar que o WP
    // redirecione o topo para o primeiro submenu do CPT (Notícias).
    add_submenu_page(
        'angopress-landing',
        'Conteúdo Landing',
        'Conteúdo Landing',
        'manage_options',
        'angopress-landing',
        'angopress_landing_page'
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

    $pillars_raw = $about['pillars'] ?? $d['about']['pillars'];
    $pillars     = json_decode( $pillars_raw, true );
    if ( ! is_array( $pillars ) ) {
        $pillars = json_decode( $d['about']['pillars'], true );
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

    // ────────────────────────────────────────────────────────────
    // GET /wp-json/angopress/v1/help  — conteúdo da página Ajuda
    // ────────────────────────────────────────────────────────────
    register_rest_route( 'angopress/v1', '/help', [
        'methods'             => 'GET',
        'callback'            => function () {
            $d_help = angopress_help_defaults();

            // ── FAQ: usar CPT angopress_faq se existirem posts publicados ──
            $faq_posts = get_posts( [
                'post_type'      => 'angopress_faq',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'meta_value_num date',
                'meta_key'       => '_faq_order',
                'order'          => 'ASC',
            ] );

            $faqs_grouped = [];
            if ( count( $faq_posts ) > 0 ) {
                foreach ( $faq_posts as $post ) {
                    $category = get_post_meta( $post->ID, '_faq_category', true ) ?: 'Geral';
                    $answer   = get_post_meta( $post->ID, '_faq_answer',   true ) ?: '';
                    if ( ! isset( $faqs_grouped[ $category ] ) ) {
                        $faqs_grouped[ $category ] = [];
                    }
                    $faqs_grouped[ $category ][] = [
                        'question' => $post->post_title,
                        'answer'   => $answer,
                    ];
                }
                $faqs = [];
                foreach ( $faqs_grouped as $cat => $items ) {
                    $faqs[] = [ 'category' => $cat, 'items' => $items ];
                }
            } else {
                $faqs = $d_help['faqs'];
            }

            // ── Guias e contactos: usar opções guardadas ou defaults ──
            $opts    = get_option( 'angopress_help', [] );
            $guides_raw = $opts['guides']  ?? null;
            $guides  = $guides_raw  ? json_decode( $guides_raw,  true ) : $d_help['guides'];
            if ( ! is_array( $guides ) ) $guides = $d_help['guides'];

            $contact = [
                'email'         => $opts['contact_email']          ?? $d_help['contact']['email'],
                'email_label'   => $opts['contact_email_label']    ?? $d_help['contact']['email_label'],
                'email_note'    => $opts['contact_email_note']     ?? $d_help['contact']['email_note'],
                'whatsapp'      => $opts['contact_whatsapp']       ?? $d_help['contact']['whatsapp'],
                'whatsapp_label'=> $opts['contact_whatsapp_label'] ?? $d_help['contact']['whatsapp_label'],
                'whatsapp_note' => $opts['contact_whatsapp_note']  ?? $d_help['contact']['whatsapp_note'],
            ];

            return rest_ensure_response( [
                'faqs'    => $faqs,
                'guides'  => $guides,
                'contact' => $contact,
            ] );
        },
        'permission_callback' => '__return_true',
    ] );
} );

// ────────────────────────────────────────────────────────────────
// CPT: angopress_faq — Perguntas frequentes (página Ajuda)
// ────────────────────────────────────────────────────────────────
add_action( 'init', function () {
    register_post_type( 'angopress_faq', [
        'labels' => [
            'name'          => 'FAQs Ajuda',
            'singular_name' => 'FAQ',
            'add_new_item'  => 'Adicionar Pergunta',
            'edit_item'     => 'Editar Pergunta',
            'menu_name'     => 'FAQs',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => 'angopress-landing',
        'show_in_rest' => true,
        'supports'     => [ 'title' ],
        'rewrite'      => false,
    ] );

    foreach ( [ '_faq_category', '_faq_answer' ] as $key ) {
        register_post_meta( 'angopress_faq', $key, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => '__return_true',
        ] );
    }
    register_post_meta( 'angopress_faq', '_faq_order', [
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'integer',
        'auth_callback'     => '__return_true',
    ] );
} );

add_action( 'add_meta_boxes', function () {
    add_meta_box(
        'angopress_faq_details',
        'Detalhes da Pergunta',
        'angopress_faq_meta_box_cb',
        'angopress_faq',
        'normal',
        'high'
    );
} );

function angopress_faq_meta_box_cb( WP_Post $post ): void {
    wp_nonce_field( 'angopress_faq_meta', 'angopress_faq_nonce' );
    $category = get_post_meta( $post->ID, '_faq_category', true ) ?: '';
    $answer   = get_post_meta( $post->ID, '_faq_answer',   true ) ?: '';
    $order    = get_post_meta( $post->ID, '_faq_order',    true ) ?: 0;
    $cats = [ 'Press Releases', 'Campanhas', 'Jornalistas e Listas', 'Assinatura e Pagamento', 'Geral' ];
    ?>
    <table class="form-table" style="margin-top:0">
        <tr>
            <th><label for="faq_category">Categoria</label></th>
            <td>
                <select id="faq_category" name="faq_category" class="regular-text">
                    <?php foreach ( $cats as $c ) : ?>
                        <option value="<?= esc_attr( $c ) ?>" <?= selected( $category, $c, false ) ?>><?= esc_html( $c ) ?></option>
                    <?php endforeach; ?>
                </select>
            </td>
        </tr>
        <tr>
            <th><label>Pergunta</label></th>
            <td><p class="description">Use o <strong>Título</strong> do post como pergunta.</p></td>
        </tr>
        <tr>
            <th><label for="faq_answer">Resposta</label></th>
            <td><textarea id="faq_answer" class="large-text" rows="5" name="faq_answer"><?= esc_textarea( $answer ) ?></textarea></td>
        </tr>
        <tr>
            <th><label for="faq_order">Ordem (dentro da categoria)</label></th>
            <td><input id="faq_order" class="small-text" type="number" min="0" name="faq_order" value="<?= esc_attr( (string) $order ) ?>">
            <p class="description">Número menor aparece primeiro. 0 = sem ordem definida.</p></td>
        </tr>
    </table>
    <?php
}

add_action( 'save_post_angopress_faq', function ( int $post_id ): void {
    if ( ! isset( $_POST['angopress_faq_nonce'] ) ) return;
    if ( ! wp_verify_nonce( $_POST['angopress_faq_nonce'], 'angopress_faq_meta' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    update_post_meta( $post_id, '_faq_category', sanitize_text_field( $_POST['faq_category'] ?? 'Geral' ) );
    update_post_meta( $post_id, '_faq_answer',   sanitize_textarea_field( $_POST['faq_answer'] ?? '' ) );
    update_post_meta( $post_id, '_faq_order',    absint( $_POST['faq_order'] ?? 0 ) );
} );

// ────────────────────────────────────────────────────────────────
// Defaults e save para guias/contactos da página Ajuda
// ────────────────────────────────────────────────────────────────
function angopress_help_defaults(): array {
    return [
        'faqs' => [
            [
                'category' => 'Press Releases',
                'items' => [
                    [ 'question' => 'Como criar um press release?', 'answer' => 'Aceda a "Press Releases" no menu lateral e clique em "Novo press release". Preencha o título, corpo do comunicado e selecione as categorias relevantes. Pode guardar como rascunho ou publicar imediatamente.' ],
                    [ 'question' => 'Qual é o limite de press releases que posso criar?', 'answer' => 'O número de press releases que pode criar depende do seu plano de assinatura. Consulte a página "Meu Plano" para ver os limites do seu plano actual.' ],
                    [ 'question' => 'Posso editar um press release já publicado?', 'answer' => 'Sim. Aceda ao press release e clique no botão de edição. Tenha em conta que alterações após publicação não são re-enviadas automaticamente para jornalistas.' ],
                ],
            ],
            [
                'category' => 'Campanhas',
                'items' => [
                    [ 'question' => 'Como funciona uma campanha de distribuição?', 'answer' => 'Uma campanha associa um press release a uma lista de mailing. Ao criar a campanha, seleciona o press release, a(s) lista(s) de destinatários e define a data/hora de envio. O sistema gere o envio de forma automática.' ],
                    [ 'question' => 'A campanha foi enviada mas não vejo estatísticas. Porquê?', 'answer' => 'As estatísticas de abertura e cliques são actualizadas de forma assíncrona. Aguarde alguns minutos após o envio e recarregue a página de Analytics.' ],
                    [ 'question' => 'Posso cancelar uma campanha agendada?', 'answer' => 'Sim, enquanto o estado for "Agendada" ou "Na fila". Aceda à campanha e use o botão de cancelamento. Após iniciar o envio (estado "A enviar"), não é possível cancelar.' ],
                ],
            ],
            [
                'category' => 'Jornalistas e Listas',
                'items' => [
                    [ 'question' => 'Como importar jornalistas via CSV?', 'answer' => 'Na página Jornalistas, clique em "Importar CSV". O ficheiro deve ter as colunas: name, email, outlet, mediaType, city. Pode exportar a lista actual para ver o formato correcto.' ],
                    [ 'question' => 'Qual a diferença entre um jornalista e uma lista de mailing?', 'answer' => 'Os jornalistas são a base de dados de contactos. As listas de mailing são agrupamentos de jornalistas que usa para segmentar os envios das campanhas.' ],
                    [ 'question' => 'Um jornalista pode estar em várias listas?', 'answer' => 'Sim. Um jornalista pode pertencer a múltiplas listas de mailing simultaneamente.' ],
                ],
            ],
            [
                'category' => 'Assinatura e Pagamento',
                'items' => [
                    [ 'question' => 'Como renovar a minha assinatura?', 'answer' => 'Aceda a "Meu Plano" e clique em "Solicitar renovação" no plano actual. A equipa AngoPress irá activar a renovação após confirmação do pagamento.' ],
                    [ 'question' => 'Como faço o pagamento?', 'answer' => 'O pagamento é feito via transferência bancária para o IBAN indicado na página de assinatura. Após a transferência, envie o comprovativo para pagamentos@angopress.ao ou WhatsApp +244 923 000 000.' ],
                    [ 'question' => 'O que acontece quando os envios do plano se esgotam?', 'answer' => 'Ao atingir o limite de envios do plano, não poderá criar novas campanhas até renovar ou actualizar o plano. O histórico e os dados ficam sempre acessíveis.' ],
                ],
            ],
        ],
        'guides' => [
            [ 'icon' => 'FileText',  'title' => 'Criar o primeiro press release',  'desc' => 'Passo a passo para redigir e publicar o seu primeiro comunicado.' ],
            [ 'icon' => 'List',      'title' => 'Organizar listas de mailing',      'desc' => 'Como segmentar jornalistas por área, meio e região.' ],
            [ 'icon' => 'Megaphone', 'title' => 'Enviar a primeira campanha',       'desc' => 'Da criação ao envio: guia completo de distribuição.' ],
            [ 'icon' => 'BarChart2', 'title' => 'Interpretar o Analytics',          'desc' => 'Entender métricas de abertura, cliques e rejeição.' ],
        ],
        'contact' => [
            'email'          => 'suporte@angopress.ao',
            'email_label'    => 'Email de suporte',
            'email_note'     => 'Resposta em até 24 horas úteis',
            'whatsapp'       => '+244923000000',
            'whatsapp_label' => 'WhatsApp',
            'whatsapp_note'  => 'Disponível das 08h às 18h (dias úteis)',
        ],
    ];
}

// ── Submenu "Ajuda" na secção AngoPress Landing ──
add_action( 'admin_menu', function () {
    add_submenu_page(
        'angopress-landing',
        'Página Ajuda',
        'Página Ajuda',
        'manage_options',
        'angopress-help',
        'angopress_help_page'
    );
}, 20 );

function angopress_help_page(): void {
    if ( ! current_user_can( 'manage_options' ) ) return;

    if ( isset( $_POST['angopress_help_save'] ) && check_admin_referer( 'angopress_save_help' ) ) {
        $d = angopress_help_defaults();

        // ── Guias ──
        $g_icons  = array_map( 'sanitize_text_field',    $_POST['guide_icon']  ?? [] );
        $g_titles = array_map( 'sanitize_text_field',    $_POST['guide_title'] ?? [] );
        $g_descs  = array_map( 'sanitize_textarea_field', $_POST['guide_desc'] ?? [] );
        $guides   = [];
        foreach ( $g_titles as $i => $t ) {
            if ( trim( $t ) === '' ) continue;
            $guides[] = [
                'icon'  => $g_icons[ $i ]  ?? 'FileText',
                'title' => $t,
                'desc'  => $g_descs[ $i ]  ?? '',
            ];
        }

        $opts = [
            'guides'                => json_encode( $guides ?: $d['guides'] ),
            'contact_email'         => sanitize_email( $_POST['contact_email']          ?? $d['contact']['email'] ),
            'contact_email_label'   => sanitize_text_field( $_POST['contact_email_label']    ?? $d['contact']['email_label'] ),
            'contact_email_note'    => sanitize_text_field( $_POST['contact_email_note']     ?? $d['contact']['email_note'] ),
            'contact_whatsapp'      => sanitize_text_field( $_POST['contact_whatsapp']       ?? $d['contact']['whatsapp'] ),
            'contact_whatsapp_label'=> sanitize_text_field( $_POST['contact_whatsapp_label'] ?? $d['contact']['whatsapp_label'] ),
            'contact_whatsapp_note' => sanitize_text_field( $_POST['contact_whatsapp_note']  ?? $d['contact']['whatsapp_note'] ),
        ];
        update_option( 'angopress_help', $opts );
        echo '<div class="notice notice-success is-dismissible"><p>✅ Conteúdo da página Ajuda guardado.</p></div>';
    }

    $d    = angopress_help_defaults();
    $opts = get_option( 'angopress_help', [] );

    $guides_raw = $opts['guides'] ?? null;
    $guides     = $guides_raw ? json_decode( $guides_raw, true ) : $d['guides'];
    if ( ! is_array( $guides ) ) $guides = $d['guides'];

    $contact = [
        'email'          => $opts['contact_email']          ?? $d['contact']['email'],
        'email_label'    => $opts['contact_email_label']    ?? $d['contact']['email_label'],
        'email_note'     => $opts['contact_email_note']     ?? $d['contact']['email_note'],
        'whatsapp'       => $opts['contact_whatsapp']       ?? $d['contact']['whatsapp'],
        'whatsapp_label' => $opts['contact_whatsapp_label'] ?? $d['contact']['whatsapp_label'],
        'whatsapp_note'  => $opts['contact_whatsapp_note']  ?? $d['contact']['whatsapp_note'],
    ];

    $icon_opts = [ 'FileText' => 'FileText (Press Release)', 'Megaphone' => 'Megaphone (Campanha)', 'List' => 'List (Listas)', 'BarChart2' => 'BarChart2 (Analytics)', 'Users' => 'Users (Jornalistas)', 'BookOpen' => 'BookOpen (Guia)', 'CreditCard' => 'CreditCard (Assinatura)' ];
    ?>
    <div class="wrap">
    <h1 style="display:flex;align-items:center;gap:8px;">
        <span class="dashicons dashicons-sos" style="font-size:28px;"></span>
        AngoPress — Página Ajuda (Dashboard)
    </h1>
    <p class="description">
        As <strong>FAQs</strong> são geridas em <a href="<?= esc_url( admin_url( 'edit.php?post_type=angopress_faq' ) ) ?>">FAQs</a> (menu lateral).<br>
        Aqui pode gerir os <strong>Guias rápidos</strong> e os <strong>contactos de suporte</strong>.<br>
        As alterações ficam disponíveis no dashboard em até 5 minutos.
    </p>
    <form method="post" style="margin-top:24px;">
        <?php wp_nonce_field( 'angopress_save_help' ); ?>

        <!-- ── Guias ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">📋 Guias rápidos</h2>
        <table class="form-table">
            <?php foreach ( $guides as $i => $g ) : ?>
            <tr>
                <th>Guia <?= $i + 1 ?></th>
                <td style="display:flex;flex-direction:column;gap:8px;">
                    <select name="guide_icon[]">
                        <?php foreach ( $icon_opts as $v => $l ) : ?>
                            <option value="<?= esc_attr( $v ) ?>" <?= selected( $g['icon'] ?? 'FileText', $v, false ) ?>><?= esc_html( $l ) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <input placeholder="Título" class="large-text" name="guide_title[]" value="<?= esc_attr( $g['title'] ?? '' ) ?>">
                    <textarea placeholder="Descrição curta" class="large-text" rows="2" name="guide_desc[]"><?= esc_textarea( $g['desc'] ?? '' ) ?></textarea>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>

        <!-- ── Contactos ── -->
        <h2 class="title" style="border-top:1px solid #ddd;padding-top:20px;">📞 Contactos de Suporte</h2>
        <table class="form-table">
            <tr>
                <th><label>Email — Endereço</label></th>
                <td><input class="regular-text" name="contact_email" type="email" value="<?= esc_attr( $contact['email'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>Email — Rótulo</label></th>
                <td><input class="regular-text" name="contact_email_label" value="<?= esc_attr( $contact['email_label'] ) ?>">
                <p class="description">Ex: "Email de suporte"</p></td>
            </tr>
            <tr>
                <th><label>Email — Nota</label></th>
                <td><input class="regular-text" name="contact_email_note" value="<?= esc_attr( $contact['email_note'] ) ?>">
                <p class="description">Ex: "Resposta em até 24 horas úteis"</p></td>
            </tr>
            <tr>
                <th><label>WhatsApp — Número</label></th>
                <td><input class="regular-text" name="contact_whatsapp" value="<?= esc_attr( $contact['whatsapp'] ) ?>">
                <p class="description">Só dígitos com prefixo do país: +244923000000</p></td>
            </tr>
            <tr>
                <th><label>WhatsApp — Rótulo</label></th>
                <td><input class="regular-text" name="contact_whatsapp_label" value="<?= esc_attr( $contact['whatsapp_label'] ) ?>"></td>
            </tr>
            <tr>
                <th><label>WhatsApp — Nota</label></th>
                <td><input class="regular-text" name="contact_whatsapp_note" value="<?= esc_attr( $contact['whatsapp_note'] ) ?>"></td>
            </tr>
        </table>

        <?php submit_button( 'Guardar', 'primary large', 'angopress_help_save' ); ?>
    </form>
    </div>
    <?php
}
