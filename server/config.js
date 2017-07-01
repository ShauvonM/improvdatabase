module.exports = function () {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return {
            "token": "fe73_yspk3g2i+6$nba6_p2zm$v0rz4ihdme*!z@++ej@^463p",
            salt: process.env.IMPROVPLUS_SALT,
            redis: {
                port: 6379,
                host: '127.0.0.1',
                auth: null
            },
            mongodb: {
                uri: 'mongodb://localhost/improvdatabase'
            },
            stripe: {
                secret: 'sk_test_hGyzBs8AVgTLppbLtZxGoCOx', // these are the test keys, obv
                publishable: 'pk_test_MKfJ3V5exd4ecf0fonYsJ1wy'
            },
            sendgrid: {
                key: process.env.SENDGRID_API_KEY
            },
            s3_buckets: {
                backups: 'improvplus.backups'
            },
            pdftkPath: 'C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe',
            port: 1919,
            saltRounds: 10
        };
    } else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
        return {
            token: process.env.SECRET,
            salt: process.env.IMPROVPLUS_SALT,
            redis: {
                url: process.env.REDISCLOUD_URL
            },
            mongodb: {
                uri: process.env.MONGODB_URI
            },
            stripe: {
                secret: process.env.STRIPE_SECRET,
                publishable: process.env.STRIPE_PUBLISHABLE
            },
            sendgrid: {
                key: process.env.SENDGRID_API_KEY
            },
            s3_buckets: {
                backups: 'improvdatabase.backups'
            },
            port: process.env.PORT || 5000,
            saltRounds: 10
        };
    }
};