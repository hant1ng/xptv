const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
}

const categories = [
    { name: '原创', url: 'https://91porn.com/v.php?category=ori&viewtype=basic' },
    { name: '当前最热', url: 'https://91porn.com/v.php?category=hot&viewtype=basic' },
    { name: '本月最热', url: 'https://91porn.com/v.php?category=top&viewtype=basic' },
    { name: '10分钟以上', url: 'https://91porn.com/v.php?category=long&viewtype=basic' },
    { name: '20分钟以上', url: 'https://91porn.com/v.php?category=longer&viewtype=basic' },
    { name: '最近加精', url: 'https://91porn.com/v.php?category=tf&viewtype=basic' },
    { name: 'rf', url: 'https://91porn.com/v.php?category=rf&viewtype=basic' },
    { name: 'top(m=-1)', url: 'https://91porn.com/v.php?category=top&m=-1&viewtype=basic' },
    { name: 'mf', url: 'https://91porn.com/v.php?category=mf&viewtype=basic' },
]

async function getConfig() {
    let config = appConfig
    config.tabs = categories.map(c => ({
        name: c.name,
        ext: { url: c.url },
    }))
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let page = ext.page || 1
    let url = ext.url
    if (page > 1) {
        url += '&page=' + page
    }

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })

    const $ = cheerio.load(data)

    $('.col-xs-12.col-sm-4.col-md-3.col-lg-3').each((_, element) => {
        const aTag = $(element).find('a').first()
        const href = aTag.attr('href')
        const title = aTag.find('.video-title').text().trim()
        const cover = aTag.find('img').attr('src')
        const duration = aTag.find('.duration').text().trim()

        if (href && title) {
            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: duration,
                ext: { url: href },
            })
        }
    })

    return jsonify({ list: cards })
}

async function getTracks(ext) {
    ext = argsify(ext)
    const url = ext.url
    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })

    const $ = cheerio.load(data)
    let mp4 = $('video#player_one_html5_api source').attr('src')

    if (!mp4) {
        // fallback: try script decode
        const scriptText = $('script:contains("strencode2")').html()
        if (scriptText) {
            const matched = scriptText.match(/src='(https?:\/\/.*?\.mp4.*?)'/)
            if (matched) mp4 = matched[1]
        }
    }

    let tracks = []
    if (mp4) {
        tracks.push({
            name: '播放',
            pan: '',
            ext: { url: mp4 },
        })
    }

    return jsonify({
        list: [{ title: '默认分组', tracks }],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url], headers: [{ 'User-Agent': UA }] })
}
