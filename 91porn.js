const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1.1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
}

const categories = [
    { name: '原创', url: 'https://91porn.com/v.php?category=ori&viewtype=basic' },
    { name: '热门', url: 'https://91porn.com/v.php?category=hot&viewtype=basic' },
    { name: '排行', url: 'https://91porn.com/v.php?category=top&viewtype=basic' },
    { name: '长片', url: 'https://91porn.com/v.php?category=long&viewtype=basic' },
    { name: '更长', url: 'https://91porn.com/v.php?category=longer&viewtype=basic' },
    { name: 'tf', url: 'https://91porn.com/v.php?category=tf&viewtype=basic' },
    { name: 'rf', url: 'https://91porn.com/v.php?category=rf&viewtype=basic' },
    { name: 'top(m=-1)', url: 'https://91porn.com/v.php?category=top&m=-1&viewtype=basic' },
    { name: 'mf', url: 'https://91porn.com/v.php?category=mf&viewtype=basic' },
]

async function getConfig() {
