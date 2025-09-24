const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
};

async function getConfig() {
    let config = appConfig;
    config.tabs = await getTabs();
    return jsonify(config);
}

async function getTabs() {
    let list = [];
    const { data } = await $fetch.get(appConfig.site, {
        headers: {
            'User-Agent': UA,
        },
    });
    const $ = cheerio.load(data);

    $('.nav-tabs a').each((_, e) => {
        const name = $(e).text();
        const href = $(e).attr('href');
        list.push({
            name,
            ext: {
                url: encodeURI(href),
            },
        });
    });

    return list;
}

async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];
    let { page = 1, url } = ext;

    if (page > 1) {
        url = url + page + '.html';
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);

    $('.video-item').each((_, element) => {
        const href = $(element).find('.thumb a').attr('href');
        const title = $(element).find('.thumb a').attr('title');
        const cover = $(element).find('.thumb img').attr('data-src');
        const subTitle = $(element).find('.duratio').text().trim();
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: href,
            },
        });
    });

    return jsonify({
        list: cards,
    });
}

async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    let url = ext.url;

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);
    const videoUrl = $('video source').attr('src');

    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: videoUrl,
        },
    });

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
            },
        ],
    });
}

async function getPlayinfo(ext) {
    ext = argsify(ext);
    const url = ext.url;

    return jsonify({ urls: [url] });
}

async function search(ext) {
    ext = argsify(ext);
    let cards = [];

    let text = encodeURIComponent(ext.text);
    let page = ext.page || 1;
    let url = `${appConfig.site}/search/${text}/${page}.html`;

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);

    $('.video-item').each((_, element) => {
        const href = $(element).find('.thumb a').attr('href');
        const title = $(element).find('.thumb a').attr('title');
        const cover = $(element).find('.thumb img').attr('data-src');
        const subTitle = $(element).find('.duratio').text().trim();
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: href,
            },
        });
    });

    return jsonify({
        list: cards,
    });
}
