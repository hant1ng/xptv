const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 2,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
}

const categories = [
    { name: '原创', url: 'https://91porn.com/v.php?category=ori&viewtype=basic' },
    { name: '热门', url: 'https://91porn.com/v.php?category=hot&viewtype=basic' },
    { name: '排行', url: 'https://91porn.com/v.php?category=top&viewtype=basic' },
    { name: '长片', url: 'https://91porn.com/v.php?category=long&viewtype=basic' },
    { name: '超长', url: 'https://91porn.com/v.php?category=longer&viewtype=basic' },
    { name: 'TF', url: 'https://91porn.com/v.php?category=tf&viewtype=basic' },
    { name: 'RF', url: 'https://91porn.com/v.php?category=rf&viewtype=basic' },
    { name: 'Top-M', url: 'https://91porn.com/v.php?category=top&m=-1&viewtype=basic' },
    { name: 'MF', url: 'https://91porn.com/v.php?category=mf&viewtype=basic' },
]

async function getConfig() {
    let config = appConfig
    config.tabs = categories.map(c => ({ name: c.name, ext: { url: c.url } }))
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let { url, page = 1 } = ext
    if (page > 1) {
        if (!url.includes('page=')) url += '&page=' + page
        else url = url.replace(/page=\d+/, 'page=' + page)
    }

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)
    let list = []

    $('.col-xs-12.col-sm-4.col-md-3.col-lg-3 .well-sm a').each((_, el) => {
        const href = $(el).attr('href')
        const title = $(el).find('.video-title').text().trim()
        const cover = $(el).find('img').attr('src')
        const duration = $(el).find('.duration').text().trim()
        if (!href) return
        list.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: duration,
            ext: { url: href },
        })
    })

    return jsonify({ list })
}

async function getTracks(ext) {
    ext = argsify(ext)
    const { url } = ext
    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)

    // 获取视频真实地址
    let videoUrl = $('video#player_one_html5_api source').attr('src')
    if (!videoUrl) {
        // fallback: 尝试解析 JS 生成的地址
        let scriptText = $('script').html()
        if (scriptText && scriptText.includes('document.write(strencode2')) {
            let match = scriptText.match(/strencode2\("([^"]+)"\)/)
            if (match) videoUrl = decodeURIComponent(match[1])
        }
    }

    if (!videoUrl) videoUrl = url // 保底，不影响APP解析

    return jsonify({
        list: [{
            title: '默认分组',
            tracks: [{
                name: '播放',
                pan: '',
                ext: { url: videoUrl, headers: [{ 'User-Agent': UA }] },
            }]
        }]
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url], headers: [{ 'User-Agent': UA }] })
}
