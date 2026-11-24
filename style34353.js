(function () {
    'use strict';

    if (window.plugin_modern_card_ready) return;
    window.plugin_modern_card_ready = true;

    var PLUGIN_ID = 'modern_card_ui';
    var SETTINGS_COMPONENT = 'modern_card_settings';

    // Значения настроек по умолчанию
    var defaults = {
        mc_enabled: true,
        mc_layout: 'glass',          // glass | minimal | compact
        mc_accent_color: 'violet',   // violet | orange | red | emerald | default
        mc_backdrop_dim: '65',       // 40 | 65 | 85
        mc_poster_radius: '16',      // 0 | 8 | 16 | 24
        mc_glow_focus: true,
        mc_colored_ratings: true,
        mc_youtube_btn: true,
        mc_hide_torrents: false,
        mc_hide_trailers: false,
        mc_hide_comments: false,
        mc_hide_similar: false,
        mc_hide_actors: false,
        mc_hide_details: false
    };

    // Инициализация настроек в Lampa.Storage
    function initStorage() {
        Object.keys(defaults).forEach(function (key) {
            if (Lampa.Storage.get(key, 'unset') === 'unset') {
                Lampa.Storage.set(key, defaults[key]);
            }
        });
    }

    // Генерация динамического CSS на основе текущих настроек
    function updateStyles() {
        var styleId = 'modern-card-dynamic-css';
        var existing = document.getElementById(styleId);
        if (existing) existing.remove();

        if (!Lampa.Storage.field('mc_enabled')) return;

        var layout = Lampa.Storage.get('mc_layout', 'glass');
        var accent = Lampa.Storage.get('mc_accent_color', 'violet');
        var dim = Lampa.Storage.get('mc_backdrop_dim', '65');
        var radius = Lampa.Storage.get('mc_poster_radius', '16');
        var glowFocus = Lampa.Storage.field('mc_glow_focus');
        var coloredRatings = Lampa.Storage.field('mc_colored_ratings');

        var hideTorrents = Lampa.Storage.field('mc_hide_torrents');
        var hideTrailers = Lampa.Storage.field('mc_hide_trailers');
        var hideComments = Lampa.Storage.field('mc_hide_comments');
        var hideSimilar = Lampa.Storage.field('mc_hide_similar');
        var hideActors = Lampa.Storage.field('mc_hide_actors');
        var hideDetails = Lampa.Storage.field('mc_hide_details');

        // Палитры акцентной кнопки
        var gradients = {
            violet: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            orange: 'linear-gradient(135deg, #ff5500 0%, #ff8800 100%)',
            red: 'linear-gradient(135deg, #e50914 0%, #b20710 100%)',
            emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            default: 'rgba(255, 255, 255, 0.18)'
        };

        var glowColors = {
            violet: 'rgba(124, 58, 237, 0.55)',
            orange: 'rgba(255, 85, 0, 0.55)',
            red: 'rgba(229, 9, 20, 0.55)',
            emerald: 'rgba(16, 185, 129, 0.55)',
            default: 'rgba(255, 255, 255, 0.35)'
        };

        var activeGradient = gradients[accent] || gradients.violet;
        var activeGlow = glowColors[accent] || glowColors.violet;
        var dimAlpha = (parseInt(dim, 10) || 65) / 100;

        var css = '';

        // 1. Задний фон (Backdrop)
        css += '.full-start__background { opacity: ' + (1 - dimAlpha + 0.25) + ' !important; transition: opacity 0.5s ease; }';
        css += '.full-start__background::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,13,18,1) 5%, rgba(12,13,18,' + dimAlpha + ') 55%, rgba(12,13,18,0.35) 100%); pointer-events: none; }';

        // 2. Стили раскладок
        if (layout === 'glass') {
            css += '.full-start-new__body, .full-start__body { background: rgba(20, 22, 30, 0.55); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 2.2em; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45); }';
        } else if (layout === 'minimal') {
            css += '.full-start-new__left, .full-start__left { display: none !important; }';
            css += '.full-start-new__right, .full-start__right { width: 100% !important; max-width: 900px; padding-left: 0 !important; }';
            css += '.full-start-new__title, .full-start__title { font-size: 3.1em !important; letter-spacing: -0.02em; }';
        } else if (layout === 'compact') {
            css += '.full-start-new__poster, .full-start__poster { width: 13em !important; }';
            css += '.full-start-new__title, .full-start__title { font-size: 2.2em !important; }';
            css += '.full-descr__text { -webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }';
        }

        // 3. Постер
        css += '.full-start-new__poster, .full-start__poster, .full-start-new__poster img, .full-start__poster img { border-radius: ' + radius + 'px !important; box-shadow: 0 14px 34px rgba(0,0,0,0.6); }';

        // 4. Заголовок и типографика
        css += '.full-start-new__title, .full-start__title { font-weight: 800 !important; text-shadow: 0 4px 16px rgba(0,0,0,0.6); line-height: 1.15 !important; }';
        css += '.full-start-new__tagline, .full-start__tagline { opacity: 0.75; font-style: italic; margin-bottom: 0.8em; }';

        // 5. Современные кнопки действий
        css += '.full-start__buttons { gap: 0.8em !important; margin-top: 1.4em !important; flex-wrap: wrap; }';
        css += '.full-start__button { border-radius: 14px !important; padding: 0.85em 1.4em !important; background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.12) !important; backdrop-filter: blur(10px); transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease !important; }';

        // Акцент на главной кнопке (первая видимая кнопка в блоке)
        css += '.full-start__buttons .full-start__button:first-child { background: ' + activeGradient + ' !important; border-color: rgba(255,255,255,0.25) !important; font-weight: 700 !important; }';

        if (glowFocus) {
            css += '.full-start__button.focus { transform: scale(1.06) translateY(-2px) !important; box-shadow: 0 10px 25px ' + activeGlow + ' !important; background-color: rgba(255, 255, 255, 0.24) !important; color: #fff !important; }';
            css += '.full-start__buttons .full-start__button:first-child.focus { background: ' + activeGradient + ' !important; box-shadow: 0 12px 30px ' + activeGlow + ' !important; }';
        }

        // 6. Цветные бейджи рейтингов и мета-информации
        if (coloredRatings) {
            css += '.full-start__rate { background: rgba(255, 255, 255, 0.1) !important; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px !important; padding: 0.35em 0.75em !important; font-weight: 700 !important; }';
            css += '.full-start__rate > div:first-child { color: #fbbf24 !important; }';
            css += '.full-start__pg, .full-start__status { background: rgba(255, 255, 255, 0.12) !important; border-radius: 8px !important; padding: 0.25em 0.6em !important; font-weight: 600; }';
        }

        // 7. Скрытие кнопок по настройкам
        if (hideTorrents) {
            css += '.full-start__button.view--torrent { display: none !important; }';
        }
        if (hideTrailers) {
            css += '.full-start__button.view--trailer { display: none !important; }';
        }

        // 8. Скрытие нижних секций карточки
        if (hideComments) {
            css += '.items-line[data-type="comments"], .full-reviews { display: none !important; }';
        }
        if (hideSimilar) {
            css += '.items-line[data-type="similars"], .items-line[data-type="recommendations"] { display: none !important; }';
        }
        if (hideActors) {
            css += '.items-line[data-type="actors"], .items-line[data-type="cast"] { display: none !important; }';
        }
        if (hideDetails) {
            css += '.full-descr__details, .full-start__details { display: none !important; }';
        }

        var style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // Добавление кастомных элементов при открытии полной карточки
    function enhanceFullCard(e) {
        if (!Lampa.Storage.field('mc_enabled')) return;
        if (e.type !== 'complite') return;

        var render = e.object.activity.render();
        var movie = e.data.movie;

        // Добавляем кнопку поиска трейлера на YouTube, если включено
        if (Lampa.Storage.field('mc_youtube_btn') && movie) {
            var buttonsContainer = render.find('.full-start__buttons');
            if (buttonsContainer.length && !buttonsContainer.find('.mc-youtube-btn').length) {
                var title = movie.title || movie.name || '';
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                var query = encodeURIComponent(title + ' ' + year + ' трейлер');

                var ytBtn = $(
                    '<div class="full-start__button selector mc-youtube-btn">' +
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">' +
                            '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' +
                        '</svg>' +
                        '<span>YouTube</span>' +
                    '</div>'
                );

                ytBtn.on('hover:enter', function () {
                    var url = 'https://www.youtube.com/results?search_query=' + query;
                    if (Lampa.Platform.is('android')) {
                        Lampa.Android.openYoutube(title + ' ' + year + ' трейлер');
                    } else {
                        window.open(url, '_blank');
                    }
                });

                buttonsContainer.append(ytBtn);
            }
        }
    }

    // Регистрация раздела настроек в Lampa
    function registerSettings() {
        Lampa.SettingsApi.addComponent({
            component: SETTINGS_COMPONENT,
            name: 'Дизайн карточки',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 3v18"/><path d="M14 9h4"/><path d="M14 14h4"/></svg>'
        });

        // Главный переключатель
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Включить современный дизайн',
                description: 'Применять кастомное оформление полной карточки фильма'
            },
            onChange: updateStyles
        });

        // Стиль раскладки
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
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
            field: {
                name: 'Макет карточки',
                description: 'Выберите расположение и стиль основного блока'
            },
            onChange: updateStyles
        });

        // Акцентный цвет
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_accent_color',
                type: 'select',
                values: {
                    violet: 'Неоновый фиолетовый',
                    orange: 'Кинопоиск оранжевый',
                    red: 'Кинотеатр красный',
                    emerald: 'Изумрудный',
                    default: 'Без градиента (Стекло)'
                },
                default: 'violet'
            },
            field: {
                name: 'Акцент главной кнопки',
                description: 'Цвет выделения первой кнопки действия и свечения фокуса'
            },
            onChange: updateStyles
        });

        // Затемнение фона
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_backdrop_dim',
                type: 'select',
                values: {
                    '40': 'Слабое (Яркий арт)',
                    '65': 'Среднее (Сбалансированное)',
                    '85': 'Сильное (Максимальный контраст)'
                },
                default: '65'
            },
            field: {
                name: 'Затемнение фонового арта',
                description: 'Регулирует читаемость текста поверх обложки'
            },
            onChange: updateStyles
        });

        // Скругление постера
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_poster_radius',
                type: 'select',
                values: {
                    '0': 'Острые углы (0px)',
                    '8': 'Лёгкое (8px)',
                    '16': 'Современное (16px)',
                    '24': 'Сильное (24px)'
                },
                default: '16'
            },
            field: {
                name: 'Скругление постера',
                description: 'Радиус скругления углов обложки'
            },
            onChange: updateStyles
        });

        // Свечение при фокусе
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_glow_focus',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Неоновое свечение при фокусе',
                description: 'Плавное увеличение и подсветка выбранной кнопки'
            },
            onChange: updateStyles
        });

        // Цветные бейджи рейтингов
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_colored_ratings',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Стилизованные бейджи рейтингов',
                description: 'Оформление оценок, статуса и возрастного рейтинга в капсулы'
            },
            onChange: updateStyles
        });

        // Кнопка YouTube
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: 'mc_youtube_btn',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Кнопка поиска на YouTube',
                description: 'Добавляет быстрый поиск трейлеров и обзоров в карточку'
            },
            onChange: updateStyles
        });

        // Скрытие кнопок и блоков
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_torrents', type: 'trigger', default: false },
            field: { name: 'Скрыть кнопку «Торренты»', description: 'Убирает кнопку торрентов из карточки' },
            onChange: updateStyles
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_trailers', type: 'trigger', default: false },
            field: { name: 'Скрыть штатную кнопку «Трейлеры»', description: 'Убирает стандартную кнопку трейлеров' },
            onChange: updateStyles
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_comments', type: 'trigger', default: false },
            field: { name: 'Скрыть комментарии', description: 'Убирает блок отзывов и комментариев снизу' },
            onChange: updateStyles
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_similar', type: 'trigger', default: false },
            field: { name: 'Скрыть похожие и рекомендации', description: 'Убирает подборки похожих фильмов' },
            onChange: updateStyles
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_actors', type: 'trigger', default: false },
            field: { name: 'Скрыть блок «Актеры»', description: 'Убирает список актеров и съемочной группы' },
            onChange: updateStyles
        });

        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: { name: 'mc_hide_details', type: 'trigger', default: false },
            field: { name: 'Скрыть технические детали', description: 'Убирает информацию о бюджете, сборах и студиях' },
            onChange: updateStyles
        });
    }

    // Запуск плагина после готовности Lampa
    function startPlugin() {
        initStorage();
        registerSettings();
        updateStyles();
        Lampa.Listener.follow('full', enhanceFullCard);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
