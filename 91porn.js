const cheerio = createCheerio()
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 3,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
    tabs: [
        { name: '原创', id: 'ori', ext: { url: 'https://91porn.com/v.php?category=ori&viewtype=basic' } },
        { name: '热门', id: 'hot', ext: { url: 'https://91porn.com/v.php?category=hot&viewtype=basic' } },
        { name: '排行榜', id: 'top', ext: { url: 'https://91porn.com/v.php?category=top&viewtype=basic' } },
        { name: '长片', id: 'long', ext: { url: 'https://91porn.com/v.php?category=long&viewtype=basic' } },
        { name: '超长片', id: 'longer', ext: { url: 'https://91porn.com/v.php?category=longer&viewtype=basic' } },
        { name: '情侣', id: 'tf', ext: { url: 'https://91porn.com/v.php?category=tf&viewtype=basic' } },
        { name: '萝莉', id: 'rf', ext: { url: 'https://91porn.com/v.php?category=rf&viewtype=basic' } },
        { name: '美女', id: 'mf', ext: { url: 'https://91porn.com/v.php?category=mf&viewtype=basic' } },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext
    if (page > 1) {
        url += `&page=${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })

    const $ = cheerio.load(data)
    $('.col-xs-12.col-sm-4.col-md-3.col-lg-3').each((_, element) => {
        const link = $(element).find('a').attr('href')
        const title = $(element).find('.video-title').text().trim()
        const cover = $(element).find('.thumb-overlay img').attr('src')
        const duration = $(element).find('.duration').text().trim()
        cards.push({
            vod_id: link,
            vod_name: title,
            vod_pic: cover,
            vod_duration: duration,
            vod_remarks: '',
            ext: { url: link },
        })
    })

    return jsonify({ list: cards })
}

async function getTracks(ext) {
    ext = argsify(ext)
    const { data } = await $fetch.get(ext.url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)

    let videoSrc = ''
    // 解析 HTML5 <video> 标签中的真实视频源
    const videoTag = $('video#player_one_html5_api source').attr('src')
    if (videoTag) {
        videoSrc = videoTag
    } else {
        // 如果有 JS document.write 生成的视频链接
        const scriptText = $('video#player_one_html5_api script').html()
        if (scriptText) {
            const match = scriptText.match(/src=\\?"(https?:\/\/.*?\.mp4.*?)"/)
            if (match) videoSrc = match[1].replace(/\\\//g, '/')
        }
    }

    if (!videoSrc) return jsonify({ list: [] })

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks: [
                    {
                        name: '播放',
                        pan: '',
                        ext: { url: videoSrc },
                    },
                ],
            },
        ],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url], headers: [{ 'User-Agent': UA }] })
}
