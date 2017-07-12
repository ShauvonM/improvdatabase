const config = require('./config')(),
    path = require('path');

/**
 * The send object should be like this:
 * {
 *      from?: email address (defaults to module.exports.contactAddress),
 *      fromName?: string (defaults to 'ImprovPlus'),
 *      to?: email address, (defaults to module.exports.contactAddress)
 *      toName?: string,
 *      subject: string,
 *      content: {content object}
 * }
 * 
 * The Content object can be any of these:
 * 
 * Standard Text:
 * {
 *      type: 'text',
 *      baseUrl: string ('https://' + req.get('host'))
 *      greeting: string (Dear blank,)
 *      body: string (html markup)
 *      action?: string (url for button)
 *      actionText: string (text on the button)
 *      afterAction: string (sincerely,...)
 * }
 */

module.exports = {

    fromAddress: 'contact@improvdatabase.com',
    contactAddress: 'contact@improvdatabase.com',

    send: (sendObject, callback) => {

        let exphbs = require('express-handlebars'),
            hbs = exphbs.create({}),

            sendgridHelper = require('sendgrid').mail,
            sendgrid = require('sendgrid')(config.sendgrid.key),

            from_email = new sendgridHelper.Email(sendObject.from || module.exports.fromAddress,
                                                sendObject.fromName || 'The Improv Database'),
            to_email = new sendgridHelper.Email(sendObject.to || module.exports.contactAddress, 
                                                sendObject.toName || 'The Improv Database'),
            //content = new sendgridHelper.Content(type, sendObject.body),
            content = sendObject.content,
            renderPromise;

        if (!content.baseUrl) {
            content.baseUrl = 'https://www.improvdatabase.com';
        }

        if (!content.afterAction) {
            content.afterAction = `
                <p>Sincerely,</p>

                <p>Shauvon McGill, Creator</p>
            `;
        }

        switch(content.type) {
            case 'text':
                renderPromise = hbs.render(
                    path.join(__dirname, '/email_templates/text.handlebars'), content);
                break;
            default:
                renderPromise = Promise.resolve(content.body);
                break;
        }
        
        renderPromise
        .catch(e => {
            console.error('Template parse error', e);
            callback(e);
        })
        .then(html => {
            let body = new sendgridHelper.Content('text/html', html);
            let mail = new sendgridHelper.Mail(from_email, sendObject.subject, to_email, body);

            let request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });

            sendgrid.API(request, (error, response) => {
                if (error) {
                    console.error(error.response.body.errors, error);
                }

                callback(error, response);
            });
        });

    }

}

/*
var nodemailer = require('nodemailer');

exports.send = function(req, res) {
    var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'shauvon.mcgill@gmail.com',
                pass: 'cvgoyzkfbhusjpoh'
            }
        }),
        mailOptions = {
            from: req.body.email || 'none@denyconformity.com',
            to: 'shauvonmcg.i.ll@gmail.com', //'contact@improvdatabase.com',
            subject: 'Improv Database Contact Submission'
        },
        html;

    html = '<p>Dear Proprietors of The Improv Comedy Database,</p>';

    html += '<p>I wish to contact you to ' + req.body.wishto + '. This particular incident has caused me to ' + req.body.caused + '. I am currently seeking ' + req.body.seeking + ' for this situation.</p>';

    html += '<p>To elaborate:</p>';

    html += '<p>***</p> <p>' + req.body.message + '</p> <p>***</p>';

    html += '<p>I demand that you ' + req.body.demand + '</p>';

    html += '<p>Sincerely, ' + req.body.name + ' - ' + req.body.email + '</p>';

    mailOptions.html = html;

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            res.json(500, error);
        } else {
            console.log('Message Sent: ', info.response);
            res.sendStatus(200);
        }
    });
};

exports.getNotified = function(req, res) {
    var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'shauvon.mcgill@gmail.com',
                pass: 'cvgoyzkfbhusjpoh'
            }
        }),
        mailOptions = {
            from: req.body.email || 'none@denyconformity.com',
            to: 'shauvonmcg.i.ll@gmail.com; kateb.dynamics@gmail.com', //'contact@improvdatabase.com',
            subject: 'Get Notified About ImprovPlus!'
        },
        html;

    html = '<p>I would like to get notified about ImprovPlus!</p>';

    html += '<p>' + req.body.firstName + ' ' + req.body.lastName + '</p>';
    html += '<p>' + req.body.email + '</p>';

    mailOptions.html = html;

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            res.json(500, error);
        } else {
            console.log('Message Sent: ', info.response);
            res.sendStatus(200);
        }
    });
};

exports.hireUs = function(req, res) {
    var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'shauvon.mcgill@gmail.com',
                pass: 'cvgoyzkfbhusjpoh'
            }
        }),
        mailOptions = {
            from: req.body.email || 'none@denyconformity.com',
            to: 'shauvonmcg.i.ll@gmail.com; kateb.dynamics@gmail.com', //'contact@improvdatabase.com',
            subject: 'Hire Us from ImprovPlus!'
        },
        html;

    html = '<p>I would like to know more about hiring ImprovPlus!</p>';

    html += '<p>' + req.body.firstName + ' ' + req.body.lastName + '</p>';
    html += '<p>' + req.body.email + '</p>';
    html += '<p>' + req.body.company + '</p>';
    html += '<p>Describe your team: ' + req.body.team + '</p>';
    html += '<p>What I want to Accomplish: ' + req.body.objective + '</p>';

    mailOptions.html = html;

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            res.json(500, error);
        } else {
            console.log('Message Sent: ', info.response);
            res.sendStatus(200);
        }
    });
};
*/

