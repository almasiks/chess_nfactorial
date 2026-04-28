export type Lang = "RU" | "KZ" | "EN";

export const TRANSLATIONS = {
  RU: {
    // Nav
    nav_home: "Главная",
    nav_play: "Играть",
    nav_learn: "Обучение",
    nav_shop: "Магазин",
    nav_profile: "Профиль",
    nav_batyr: "Батыр",
    nav_login: "Войти",
    nav_register: "Регистрация",
    nav_logout: "Выйти",

    // Home — hero
    hero_subtitle: "От Номада до Великого Кагана",
    hero_desc:
      "Шахматная платформа с казахским духом. Зарабатывай Асыки, проходи Испытание Батыра и веди свою орду к победе!",
    hero_cta_play: "Начать игру →",
    hero_cta_challenge: "Испытание Батыра",

    // Home — stats
    stat_players: "Игроков на платформе",
    stat_asyqs: "Асыков заработано",
    stat_games: "Партий сыграно",

    // Home — features
    feat_label: "Возможности платформы",
    feat_heading: "Арсенал Великого Степного Игрока",
    feat_friend_title: "Игра с другом",
    feat_friend_desc:
      "Отправь QR-приглашение другу или найди его по имени пользователя. Сыграй прямо сейчас.",
    feat_learn_title: "Обучение",
    feat_learn_desc:
      "Интерактивные уроки по дебютам, тактическим приёмам и шахматной терминологии.",
    feat_batyr_title: "Испытание Батыра",
    feat_batyr_desc:
      "Ежедневная задача. Реши мат в 3 хода — получи +20 Асыков!",
    feat_leader_title: "Таблица лидеров",
    feat_leader_desc:
      "Рейтинг по Алматы, Казахстану и Миру. Покажи, на что ты способен!",

    // Home — pricing
    pricing_label: "Подписка",
    pricing_heading: "Выбери свой путь",
    pricing_cta: "Выбрать тариф →",
    pricing_popular: "Популярный",
    tier_nomad_name: "Номад",
    tier_nomad_price: "Бесплатно",
    tier_nomad_desc: "Основные функции, рейтинговые игры, таблица лидеров",
    tier_sultan_name: "Султан",
    tier_sultan_price: "1 990 ₸/мес",
    tier_sultan_desc: "AI-тренер, анализ партий, расширенная статистика",
    tier_khan_name: "Великий Хан",
    tier_khan_price: "4 990 ₸/мес",
    tier_khan_desc: "«Алтын Адам» скин, закрытые турниры, VIP-матчи",

    // Leaderboard
    lb_label: "Рейтинговая система",
    lb_heading: "Таблица лидеров",
    lb_desc: "Поднимай свой рейтинг и стань великим лидером Степи.",
    lb_almaty: "Алматы",
    lb_kz: "Казахстан",
    lb_world: "Весь мир",
    lb_player: "Игрок",
    lb_creator: "Создатель",
    lb_wins: "побед",
    lb_cta_title: "Повысь свой рейтинг!",
    lb_cta_desc:
      "Играй партии, решай Испытание Батыра и зарабатывай Асыки — рейтинг вырастет сам.",
    lb_play: "Начать игру",
    lb_batyr: "🏹 Испытание Батыра",

    // Store
    store_label: "Жібек Жолы Базары",
    store_heading: "Silk Road Bazaar",
    store_desc:
      "Эксклюзивные шахматные товары и одежда для настоящих воинов Великой Степи.",
    store_cart: "🛍️ Корзина",
    store_pro_badge: "✓ Скидка Sultan −5% применяется автоматически",
    store_chess_tab: "♟ Шахматы",
    store_clothes_tab: "👘 Одежда",
    store_add: "+ В корзину",
    store_empty_cart: "Корзина пуста — добавь товары из Базара",
    store_checkout: "Оформить заказ через Kaspi →",
    store_delivery: "Доставка по всему Казахстану",
    store_no_discount: "Без скидки",
    store_discount: "Скидка Sultan −5%",
    store_total: "Итого",
    store_banner_title: "Стань Великим Ханом",
    store_banner_desc:
      "Подписка Sultan даёт скидку 5% на все товары Базара навсегда.",
    store_banner_cta: "Получить Sultan →",

    // Puzzle
    puzzle_label: "Ежедневное испытание",
    puzzle_turn_white: "Белые",
    puzzle_turn_black: "Чёрные",
    puzzle_move: "Ход:",
    puzzle_refresh: "Обновить",
    puzzle_loading: "Загружаем задачу...",
    puzzle_advisor: "Советник Хана",
    puzzle_progress: "Прогресс",
    puzzle_reward: "Награда",
    puzzle_asyqs: "Асыков за решение",
    puzzle_rating: "Рейтинг (без ошибок)",
    puzzle_hint: "💡 Дать подсказку",
    puzzle_hint_more: "💡 Ещё подсказка",
    puzzle_solved: "Маш! Задача решена!",
    puzzle_failed: "Попытка не удалась",
    puzzle_next: "Следующая задача →",
    puzzle_wrong: "Попробуй другой путь, Батыр",
    puzzle_themes: "Темы:",
    puzzle_solved_today: "✅ Ты уже решил эту задачу сегодня!",
  },

  KZ: {
    // Nav
    nav_home: "Басты бет",
    nav_play: "Ойнау",
    nav_learn: "Оқыту",
    nav_shop: "Дүкен",
    nav_profile: "Профиль",
    nav_batyr: "Батыр",
    nav_login: "Кіру",
    nav_register: "Тіркелу",
    nav_logout: "Шығу",

    // Home — hero
    hero_subtitle: "Номадтан Ұлы Қағанға дейін",
    hero_desc:
      "Қазақ рухымен шахмат платформасы. Асықтар тап, Батыр сынағынан өт және ордаңды жеңіске жетелеу!",
    hero_cta_play: "Ойынды бастау →",
    hero_cta_challenge: "Батыр сынағы",

    // Home — stats
    stat_players: "Платформадағы ойыншылар",
    stat_asyqs: "Асықтар тапты",
    stat_games: "Партиялар ойналды",

    // Home — features
    feat_label: "Платформа мүмкіндіктері",
    feat_heading: "Ұлы Дала Ойыншысының Арсеналы",
    feat_friend_title: "Досыңмен ойна",
    feat_friend_desc:
      "Досыңа QR-шақыру жіберіңіз немесе оны пайдаланушы атымен табыңыз.",
    feat_learn_title: "Оқыту",
    feat_learn_desc:
      "Дебюттер, тактикалық тәсілдер және шахмат терминологиясы бойынша интерактивті сабақтар.",
    feat_batyr_title: "Батыр сынағы",
    feat_batyr_desc: "Күнделікті тапсырма. 3 жылжымда мат — +20 Асық!",
    feat_leader_title: "Көшбасшылар кестесі",
    feat_leader_desc:
      "Алматы, Қазақстан және Әлем бойынша рейтинг. Өзіңді көрсет!",

    // Home — pricing
    pricing_label: "Жазылым",
    pricing_heading: "Өз жолыңды таңда",
    pricing_cta: "Тарифті таңдаңыз →",
    pricing_popular: "Танымал",
    tier_nomad_name: "Номад",
    tier_nomad_price: "Тегін",
    tier_nomad_desc:
      "Негізгі мүмкіндіктер, рейтингтік ойындар, көшбасшылар кестесі",
    tier_sultan_name: "Сұлтан",
    tier_sultan_price: "1 990 ₸/ай",
    tier_sultan_desc: "AI-жаттықтырушы, партия талдауы, кеңейтілген статистика",
    tier_khan_name: "Ұлы Хан",
    tier_khan_price: "4 990 ₸/ай",
    tier_khan_desc: "«Алтын Адам» скин, жабық турнирлер, VIP-матчтар",

    // Leaderboard
    lb_label: "Рейтинг жүйесі",
    lb_heading: "Көшбасшылар кестесі",
    lb_desc: "Рейтингіңді арттыр және Даланың ұлы көшбасшысы бол.",
    lb_almaty: "Алматы",
    lb_kz: "Қазақстан",
    lb_world: "Бүкіл әлем",
    lb_player: "Ойыншы",
    lb_creator: "Жасаушы",
    lb_wins: "жеңіс",
    lb_cta_title: "Рейтингіңді арттыр!",
    lb_cta_desc:
      "Партиялар ойна, Батыр сынағын шеш және Асықтар тап — рейтинг өседі.",
    lb_play: "Ойынды бастау",
    lb_batyr: "🏹 Батыр сынағы",

    // Store
    store_label: "Жібек Жолы Базары",
    store_heading: "Silk Road Bazaar",
    store_desc:
      "Ұлы Дала жауынгерлері үшін эксклюзивті шахмат тауарлары мен киімдер.",
    store_cart: "🛍️ Себет",
    store_pro_badge: "✓ Sultan жеңілдігі −5% автоматты түрде қолданылады",
    store_chess_tab: "♟ Шахмат",
    store_clothes_tab: "👘 Киім",
    store_add: "+ Себетке",
    store_empty_cart: "Себет бос — Базардан тауар қосыңыз",
    store_checkout: "Kaspi арқылы тапсырыс беру →",
    store_delivery: "Бүкіл Қазақстан бойынша жеткізу",
    store_no_discount: "Жеңілдіксіз",
    store_discount: "Sultan жеңілдігі −5%",
    store_total: "Барлығы",
    store_banner_title: "Ұлы Хан бол",
    store_banner_desc:
      "Sultan жазылымы Базардың барлық тауарларына 5% жеңілдік береді.",
    store_banner_cta: "Sultan алу →",

    // Puzzle
    puzzle_label: "Күнделікті сынақ",
    puzzle_turn_white: "Ақтар",
    puzzle_turn_black: "Қаралар",
    puzzle_move: "Жүріс:",
    puzzle_refresh: "Жаңарту",
    puzzle_loading: "Тапсырма жүктелуде...",
    puzzle_advisor: "Ханның Кеңесшісі",
    puzzle_progress: "Прогресс",
    puzzle_reward: "Сыйақы",
    puzzle_asyqs: "Шешім үшін асықтар",
    puzzle_rating: "Рейтинг (қателіксіз)",
    puzzle_hint: "💡 Кеңес беру",
    puzzle_hint_more: "💡 Тағы кеңес",
    puzzle_solved: "Маш! Тапсырма шешілді!",
    puzzle_failed: "Әрекет сәтсіз болды",
    puzzle_next: "Келесі тапсырма →",
    puzzle_wrong: "Басқа жолды байқа, Батыр",
    puzzle_themes: "Тақырыптар:",
    puzzle_solved_today: "✅ Бүгін осы тапсырманы шештіңіз!",
  },

  EN: {
    // Nav
    nav_home: "Home",
    nav_play: "Play",
    nav_learn: "Learn",
    nav_shop: "Shop",
    nav_profile: "Profile",
    nav_batyr: "Batyr",
    nav_login: "Log in",
    nav_register: "Sign up",
    nav_logout: "Log out",

    // Home — hero
    hero_subtitle: "From Nomad to Great Khan",
    hero_desc:
      "A chess platform with Kazakh spirit. Earn Asyqs, conquer the Batyr Challenge, and lead your horde to victory!",
    hero_cta_play: "Start playing →",
    hero_cta_challenge: "Batyr Challenge",

    // Home — stats
    stat_players: "Players on platform",
    stat_asyqs: "Asyqs earned",
    stat_games: "Games played",

    // Home — features
    feat_label: "Platform features",
    feat_heading: "Arsenal of the Great Steppe Player",
    feat_friend_title: "Play with a friend",
    feat_friend_desc:
      "Send a QR invite to a friend or find them by username. Play right now.",
    feat_learn_title: "Learning",
    feat_learn_desc:
      "Interactive lessons on openings, tactical techniques, and chess terminology.",
    feat_batyr_title: "Batyr Challenge",
    feat_batyr_desc:
      "Daily puzzle. Solve mate in 3 — earn +20 Asyqs!",
    feat_leader_title: "Leaderboard",
    feat_leader_desc:
      "Rankings for Almaty, Kazakhstan, and the World. Show what you can do!",

    // Home — pricing
    pricing_label: "Subscription",
    pricing_heading: "Choose your path",
    pricing_cta: "Choose a plan →",
    pricing_popular: "Popular",
    tier_nomad_name: "Nomad",
    tier_nomad_price: "Free",
    tier_nomad_desc: "Core features, rated games, leaderboard",
    tier_sultan_name: "Sultan",
    tier_sultan_price: "1 990 ₸/mo",
    tier_sultan_desc: "AI coach, game analysis, advanced statistics",
    tier_khan_name: "Great Khan",
    tier_khan_price: "4 990 ₸/mo",
    tier_khan_desc: "Altyn Adam skin, exclusive tournaments, VIP matches",

    // Leaderboard
    lb_label: "Rating system",
    lb_heading: "Leaderboard",
    lb_desc: "Boost your rating and become the great leader of the Steppe.",
    lb_almaty: "Almaty",
    lb_kz: "Kazakhstan",
    lb_world: "World",
    lb_player: "Player",
    lb_creator: "Creator",
    lb_wins: "wins",
    lb_cta_title: "Boost your rating!",
    lb_cta_desc:
      "Play games, solve the Batyr Challenge, earn Asyqs — your rating will grow.",
    lb_play: "Start playing",
    lb_batyr: "🏹 Batyr Challenge",

    // Store
    store_label: "Жібек Жолы Базары",
    store_heading: "Silk Road Bazaar",
    store_desc:
      "Exclusive chess products and apparel for true warriors of the Great Steppe.",
    store_cart: "🛍️ Cart",
    store_pro_badge: "✓ Sultan discount −5% applied automatically",
    store_chess_tab: "♟ Chess",
    store_clothes_tab: "👘 Clothing",
    store_add: "+ Add to cart",
    store_empty_cart: "Cart is empty — add items from the Bazaar",
    store_checkout: "Checkout via Kaspi →",
    store_delivery: "Delivery across all Kazakhstan",
    store_no_discount: "Without discount",
    store_discount: "Sultan discount −5%",
    store_total: "Total",
    store_banner_title: "Become the Great Khan",
    store_banner_desc:
      "Sultan subscription gives 5% off all Bazaar items forever.",
    store_banner_cta: "Get Sultan →",

    // Puzzle
    puzzle_label: "Daily Challenge",
    puzzle_turn_white: "White",
    puzzle_turn_black: "Black",
    puzzle_move: "Turn:",
    puzzle_refresh: "Refresh",
    puzzle_loading: "Loading puzzle...",
    puzzle_advisor: "Khan's Advisor",
    puzzle_progress: "Progress",
    puzzle_reward: "Reward",
    puzzle_asyqs: "Asyqs for solving",
    puzzle_rating: "Rating (no mistakes)",
    puzzle_hint: "💡 Get a hint",
    puzzle_hint_more: "💡 Another hint",
    puzzle_solved: "Mash! Puzzle solved!",
    puzzle_failed: "Attempt failed",
    puzzle_next: "Next puzzle →",
    puzzle_wrong: "Try another path, Batyr",
    puzzle_themes: "Themes:",
    puzzle_solved_today: "✅ You already solved this puzzle today!",
  },
} as const;

export type T = typeof TRANSLATIONS.RU;
export type TKey = keyof T;
