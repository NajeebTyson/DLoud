const translate = require('google-translate-api');

translate('What is your name', {from: 'en', to: 'ur'}).then(res => {
    console.log(res.text);
    //=> I speak English
    console.log(res.from.language.iso);
    //=> nl
}).catch(err => {
    console.error(err);
});
