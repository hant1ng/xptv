const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com',
}

const categories = [
    { name: '原创', url: 'https://91porn.com/v.php?category=ori&viewtype=basic' },
    { name: '热门', url: 'https://91porn.com/v.php?category=hot&viewtype=basic' },
    { name: '排行', url: 'https://91porn.com/v.php?category=top&viewtype=basic' },
    { name: '长片', url: 'https://91porn.com/v.php?category=long&viewtype=basic' },
    { name: '更长', url: 'https://91porn.com/v.php?category=longer&viewtype=basic' },
    { name: 'TF', url: 'https://91porn.com/v.php?category=tf&viewtype=basic' },
    { name: 'RF', url: 'https://91porn.com/v.php?category=rf&viewtype=basic' },
    { name: 'TOP(-1)', url: 'https://91porn.com/v.php?category=top&m=-1&viewtype=basic' },
    { name: 'MF', url: 'https://91porn.com/v.php?category=mf&viewtype=basic' },
]

async function getConfig() {
    let config = appConfig
    config.tabs = categories.map(c => ({ name: c.name, ext: { url: c.url } }))
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let { page = 1, url } = ext
    if (page > 1) url = url + '&page=' + page

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA }
    })

    const $ = cheerio.load(data)
    let cards = []

    $('.col-xs-12.col-sm-4.col-md-3.col-lg-3').each((_, el) => {
        const a = $(el).find('a')
        const href = a.attr('href')
        const title = a.find('.video-title').text().trim()
        const cover = a.find('img').attr('src')
        const duration = a.find('.duration').text().trim()

        if (href && title && cover) {
            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: duration,
                ext: { url: href }
            })
        }
    })

    return jsonify({ list: cards })
}

async function getTracks(ext) {
    ext = argsify(ext)
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA }
    })

    const $ = cheerio.load(data)
    const src = $('video#player_one_html5_api source').attr('src')

    let tracks = []
    if (src) {
        tracks.push({
            name: '播放',
            pan: '',
            ext: { url: src }
        })
    }

    return jsonify({
        list: [{ title: '默认分组', tracks }]
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url] })
}
