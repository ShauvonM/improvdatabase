module.exports = function () {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return {
            "token": "fe73_yspk3g2i+6$nba6_p2zm$v0rz4ihdme*!z@++ej@^463p",
            redis: {
                port: 6379,
                host: '127.0.0.1',
                auth: null
            },
            mongodb: {
                uri: 'mongodb://localhost/improvdatabase'
            },
            stripe: {
                secret: 'sk_test_Gfa3JD2I7VGXJg3uCBO3wOds', // these are the test keys, obv
                publishable: 'pk_test_SyIYpiJyVAEGe0HyDXPDyIix'
            },
            sendgrid: {
                key: process.env.SENDGRID_API_KEY
            },
            s3_buckets: {
                backups: 'improvdatabase.backups'
            },
            pdftkPath: 'C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe',
            port: 1919,
            saltRounds: 10,
            title: 'The Improv Database'
        };
    } else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
        return {
            token: process.env.SECRET,
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
            saltRounds: 10,
            title: 'The Improv Database'
        };
    }
};