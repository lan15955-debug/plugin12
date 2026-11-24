(function () {
    'use strict';

    if (window.plugin_modern_card_loaded) return;
    window.plugin_modern_card_loaded = true;

    var PLUGIN_NAME = 'Дизайн карточки';
    var COMPONENT_ID = 'modern_card_ui';

    // Настройки по умолчанию
    var DEFAULTS = {
        mc_enabled: true,
        mc_layout: 'glass',
        mc_accent: 'violet',
        mc_backdrop_dim: '65',
        mc_poster_radius: '16',
        mc_title_size: 'normal',
        mc_glow_focus: true,
        mc_colored_badges: true,
        mc_youtube_btn: true,
        mc_kp_btn: false,
        mc_hide_torrents: false,
        mc_hide_trailers: false,
        mc_hide_comments: false,
        mc_hide_similar: false,
        mc_hide_actors: false,
        mc_hide_details: false
    };

    // Инициализация хранилища
    function initDefaults() {
        for (var key in DEFAULTS) {
            if (DEFAULTS.hasOwnProperty(key)) {
                if (Lampa.Storage.get(key, 'unset') === 'unset') {
                    Lampa.Storage.set(key, DEFAULTS[key]);
                }
            }
        }
    }

    // Регистрация манифеста плагина в системе Lampa
    function registerManifest() {
        var manifest = {
            type: 'other',
            version: '1.2.0',
            name: PLUGIN_NAME,
            description: 'Современное оформление полной карточки фильма и сериала с гибкими настройками',
            component: COMPONENT_ID
        };

        if (Lampa.Manifest && Lampa.Manifest.plugins) {
            if (Array.isArray(Lampa.Manifest.plugins)) {
                Lampa.Manifest.plugins.push(manifest);
            } else {
                Lampa.Manifest.plugins[COMPONENT_ID] = manifest;
            }
        }
    }

    // Применение CSS-стилей на основе выбранных настроек
    function applyStyles() {
        var styleId = 'mc-custom-styles';
        var oldStyle = document.getElementById(styleId);
        if (oldStyle && oldStyle.parentNode) {
            oldStyle.parentNode.removeChild(oldStyle);
        }

        if (!Lampa.Storage.field('mc_enabled')) return;

        var layout = Lampa.Storage.get('mc_layout', 'glass');
        var accent = Lampa.Storage.get('mc_accent', 'violet');
        var dim = parseInt(Lampa.Storage.get('mc_backdrop_dim', '65'), 10) || 65;
        var radius = parseInt(Lampa.Storage.get('mc_poster_radius', '16'), 10);
        var titleSize = Lampa.Storage.get('mc_title_size', 'normal');
        var glowFocus = Lampa.Storage.field('mc_glow_focus');
        var coloredBadges = Lampa.Storage.field('mc_colored_badges');

        var hideTorrents = Lampa.Storage.field('mc_hide_torrents');
        var hideTrailers = Lampa.Storage.field('mc_hide_trailers');
        var hideComments = Lampa.Storage.field('mc_hide_comments');
        var hideSimilar = Lampa.Storage.field('mc_hide_similar');
        var hideActors = Lampa.Storage.field('mc_hide_actors');
        var hideDetails = Lampa.Storage.field('mc_hide_details');

        var gradients = {
            violet: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            orange: 'linear-gradient(135deg, #ff5500 0%, #ff8800 100%)',
            red: 'linear-gradient(135deg, #e50914 0%, #b20710 100%)',
            emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            blue: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            none: 'rgba(255, 255, 255, 0.16)'
        };

        var glows = {
            violet: 'rgba(124, 58, 237, 0.6)',
            orange: 'rgba(255, 85, 0, 0.6)',
            red: 'rgba(229, 9, 20, 0.6)',
            emerald: 'rgba(16, 185, 129, 0.6)',
            blue: 'rgba(37, 99, 235, 0.6)',
            none: 'rgba(255, 255, 255, 0.35)'
        };

        var activeGradient = gradients[accent] || gradients.violet;
        var activeGlow = glows[accent] || glows.violet;
        var dimAlpha = (dim / 100).toFixed(2);
        var bgOpacity = Math.max(0.25, 1 - (dim / 100) + 0.2).toFixed(2);

        var css = [];

        // 1. Фоновый арт (Backdrop)
        css.push('.full-start__background { opacity: ' + bgOpacity + ' !important; transition: opacity 0.4s ease; }');
        css.push('.full-start__background::after { content: ""; position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(to top, rgba(12,13,18,1) 4%, rgba(12,13,18,' + dimAlpha + ') 55%, rgba(12,13,18,0.3) 100%); pointer-events: none; }');

        // 2. Макет карточки
        if (layout === 'glass') {
            css.push('.full-start-new__body, .full-start__body { background: rgba(22, 24, 34, 0.58); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 24px; padding: 2em; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45); }');
        } else if (layout === 'minimal') {
            css.push('.full-start-new__left, .full-start__left { display: none !important; }');
            css.push('.full-start-new__right, .full-start__right { width: 100% !important; max-width: 960px; padding-left: 0 !important; }');
        } else if (layout === 'compact') {
            css.push('.full-start-new__poster, .full-start__poster { width: 13em !important; }');
            css.push('.full-descr__text { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }');
        }

        // 3. Постер
        css.push('.full-start-new__poster, .full-start__poster, .full-start-new__poster img, .full-start__poster img { border-radius: ' + radius + 'px !important; box-shadow: 0 14px 35px rgba(0, 0, 0, 0.65); }');

        // 4. Заголовок
        var fontSizeMap = {
            small: '2.1em',
            normal: '2.6em',
            large: '3.2em'
        };
        var currentTitleSize = fontSizeMap[titleSize] || '2.6em';
        css.push('.full-start-new__title, .full-start__title { font-size: ' + currentTitleSize + ' !important; font-weight: 800 !important; line-height: 1.15 !important; text-shadow: 0 4px 18px rgba(0, 0, 0, 0.65); }');
        css.push('.full-start-new__tagline, .full-start__tagline { opacity: 0.75; font-style: italic; margin-bottom: 0.8em; }');

        // 5. Кнопки действий
        css.push('.full-start__buttons { gap: 0.75em !important; margin-top: 1.3em !important; flex-wrap: wrap; }');
        css.push('.full-start__button { border-radius: 14px !important; padding: 0.8em 1.35em !important; background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important; }');
        css.push('.full-start__buttons .full-start__button:first-child { background: ' + activeGradient + ' !important; border-color: rgba(255, 255, 255, 0.28) !important; font-weight: 700 !important; }');

        if (glowFocus) {
            css.push('.full-start__button.focus { transform: scale(1.06) translateY(-2px) !important; box-shadow: 0 10px 26px ' + activeGlow + ' !important; background-color: rgba(255, 255, 255, 0.24) !important; color: #ffffff !important; }');
            css.push('.full-start__buttons .full-start__button:first-child.focus { background: ' + activeGradient + ' !important; box-shadow: 0 12px 32px ' + activeGlow + ' !important; }');
        }

        // 6. Бейджи рейтингов и мета-данных
        if (coloredBadges) {
            css.push('.full-start__rate { background: rgba(255, 255, 255, 0.11) !important; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 10px !important; padding: 0.35em 0.75em !important; font-weight: 700 !important; }');
            css.push('.full-start__rate > div:first-child { color: #fbbf24 !important; }');
            css.push('.full-start__pg, .full-start__status { background: rgba(255, 255, 255, 0.14) !important; border-radius: 8px !important; padding: 0.25em 0.65em !important; font-weight: 600 !important; }');
        }

        // 7. Скрытие кнопок и секций
        if (hideTorrents) css.push('.full-start__button.view--torrent { display: none !important; }');
        if (hideTrailers) css.push('.full-start__button.view--trailer { display: none !important; }');
        if (hideComments) css.push('.items-line[data-type="comments"], .full-reviews { display: none !important; }');
        if (hideSimilar) css.push('.items-line[data-type="similars"], .items-line[data-type="recommendations"] { display: none !important; }');
        if (hideActors) css.push('.items-line[data-type="actors"], .items-line[data-type="cast"] { display: none !important; }');
        if (hideDetails) css.push('.full-descr__details, .full-start__details { display: none !important; }');

        var styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(css.join('\n')));
        document.head.appendChild(styleEl);
    }

    // Модификация DOM полной карточки при открытии
    function onFullCardEvent(e) {
        if (!Lampa.Storage.field('mc_enabled')) return;
        if (e.type !== 'complite') return;

        var render = e.object.activity.render();
        var movie = e.data && e.data.movie ? e.data.movie : null;
        if (!movie) return;

        var buttonsBox = render.find('.full-start__buttons');
        if (!buttonsBox.length) return;

        var title = movie.title || movie.name || '';
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);

        // Кнопка YouTube
        if (Lampa.Storage.field('mc_youtube_btn') && !buttonsBox.find('.mc-btn-youtube').length) {
            var ytBtn = $(
                '<div class="full-start__button selector mc-btn-youtube">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; flex-shrink: 0;">' +
                        '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' +
                    '</svg>' +
                    '<span>YouTube</span>' +
                '</div>'
            );

            ytBtn.on('hover:enter', function () {
                var queryText = title + ' ' + year + ' трейлер';
                if (Lampa.Platform && Lampa.Platform.is('android') && Lampa.Android && Lampa.Android.openYoutube) {
                    Lampa.Android.openYoutube(queryText);
                } else {
                    window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(queryText), '_blank');
                }
            });

            buttonsBox.append(ytBtn);
        }

        // Кнопка Кинопоиск
        if (Lampa.Storage.field('mc_kp_btn') && !buttonsBox.find('.mc-btn-kp').length) {
            var kpBtn = $(
                '<div class="full-start__button selector mc-btn-kp">' +
                    '<span style="font-weight: 800; color: #ff5500; margin-right: 6px;">КП</span>' +
                    '<span>Кинопоиск</span>' +
                '</div>'
            );

            kpBtn.on('hover:enter', function () {
                var kpQuery = encodeURIComponent(title + ' ' + year);
                window.open('https://www.kinopoisk.ru/index.php?kp_query=' + kpQuery, '_blank');
            });

            buttonsBox.append(kpBtn);
        }
    }

    // Создание раздела настроек в меню Lampa
    function registerSettings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: COMPONENT_ID,
            name: PLUGIN_NAME,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="14" y1="9" x2="18" y2="9"></line><line x1="14" y1="14" x2="18" y2="14"></line></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_enabled', type: 'trigger', default: true },
            field: { name: 'Включить дизайн карточки', description: 'Активировать кастомное оформление полной карточки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: {
                name: 'mc_layout',
                type: 'select',
                values: {
                    glass: 'Кинотеатр (Glassmorphism)',
                    minimal: 'Минимализм (Без постера)',
                    compact: 'Компактный (Для ТВ)'
                },
                default: 'glass'
            },
            field: { name: 'Макет карточки', description: 'Выберите стиль отображения основного блока' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: {
                name: 'mc_accent',
                type: 'select',
                values: {
                    violet: 'Неоновый фиолетовый',
                    orange: 'Кинопоиск оранжевый',
                    red: 'Кинотеатр красный',
                    emerald: 'Изумрудный',
                    blue: 'Глубокий синий',
                    none: 'Без градиента (Стекло)'
                },
                default: 'violet'
            },
            field: { name: 'Акцентный цвет', description: 'Цвет главной кнопки действия и свечения при фокусе' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: {
                name: 'mc_backdrop_dim',
                type: 'select',
                values: {
                    '40': 'Слабое (Яркий фон)',
                    '65': 'Среднее (Сбалансированное)',
                    '85': 'Сильное (Максимальный контраст)'
                },
                default: '65'
            },
            field: { name: 'Затемнение фонового арта', description: 'Уровень затемнения заднего плана для читаемости текста' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: {
                name: 'mc_poster_radius',
                type: 'select',
                values: {
                    '0': 'Без скругления (0px)',
                    '8': 'Лёгкое (8px)',
                    '16': 'Современное (16px)',
                    '24': 'Сильное (24px)'
                },
                default: '16'
            },
            field: { name: 'Скругление углов постера', description: 'Радиус скругления обложки фильма' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: {
                name: 'mc_title_size',
                type: 'select',
                values: {
                    small: 'Компактный',
                    normal: 'Стандартный',
                    large: 'Крупный'
                },
                default: 'normal'
            },
            field: { name: 'Размер заголовка', description: 'Масштаб названия фильма или сериала' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_glow_focus', type: 'trigger', default: true },
            field: { name: 'Свечение кнопок при фокусе', description: 'Подсветка и лёгкое увеличение активной кнопки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_colored_badges', type: 'trigger', default: true },
            field: { name: 'Капсулы рейтингов и статусов', description: 'Оформление оценок, возраста и статуса в современные бейджи' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_youtube_btn', type: 'trigger', default: true },
            field: { name: 'Кнопка поиска на YouTube', description: 'Быстрый переход к трейлерам и обзорам на YouTube' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_kp_btn', type: 'trigger', default: false },
            field: { name: 'Кнопка поиска на Кинопоиске', description: 'Добавляет кнопку открытия страницы поиска на Кинопоиске' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_torrents', type: 'trigger', default: false },
            field: { name: 'Скрыть кнопку «Торренты»', description: 'Убирает кнопку торрентов из панели действий' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_trailers', type: 'trigger', default: false },
            field: { name: 'Скрыть штатную кнопку «Трейлеры»', description: 'Убирает стандартную кнопку трейлеров' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_comments', type: 'trigger', default: false },
            field: { name: 'Скрыть комментарии', description: 'Убирает блок комментариев в нижней части карточки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_similar', type: 'trigger', default: false },
            field: { name: 'Скрыть похожие и рекомендации', description: 'Убирает подборки похожих фильмов и сериалов' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_actors', type: 'trigger', default: false },
            field: { name: 'Скрыть блок «Актеры»', description: 'Убирает список актеров и съёмочной группы' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_hide_details', type: 'trigger', default: false },
            field: { name: 'Скрыть детали и сборы', description: 'Убирает техническую информацию о бюджете и студиях' },
            onChange: applyStyles
        });

        // Кнопка сброса настроек
        Lampa.SettingsApi.addParam({
            component: COMPONENT_ID,
            param: { name: 'mc_reset', type: 'button' },
            field: { name: 'Сбросить настройки дизайна', description: 'Вернуть все параметры плагина к значениям по умолчанию' },
            onChange: function () {
                for (var key in DEFAULTS) {
                    if (DEFAULTS.hasOwnProperty(key)) {
                        Lampa.Storage.set(key, DEFAULTS[key]);
                    }
                }
                applyStyles();
                if (Lampa.Noty) Lampa.Noty.show('Настройки дизайна сброшены');
                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
            }
        });
    }

    // Точка входа
    function start() {
        initDefaults();
        registerManifest();
        registerSettings();
        applyStyles();
        Lampa.Listener.follow('full', onFullCardEvent);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                start();
            }
        });
    }
})();
