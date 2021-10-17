var express = require('express');
var exphbs = require('express-handlebars');
var port = process.env.PORT || 3000

// SDK de Mercado Pago
const mercadopago = require('mercadopago');
//Configurar mercadopago
mercadopago.configure({
    access_token: 'APP_USR-1159009372558727-072921-8d0b9980c7494985a5abd19fbe921a3d-617633181',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
});
var app = express();
var id = '';

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

const getMercadoResponseInfo = (req) => {
    let data = {
        paymentId: req.query.collection_id,
        paymentMethodId: req.query.payment_type,
        externalReference: req.query.external_reference,
    };
    return data;
}

app.get('/detail', function (req, res) {
    // Crea un objeto de preferencia
    let preference = {
        items: [
            {
                id: "1234",
                title: req.query.title,
                description: 'Teléfono de tienda e-commerce',
                picture_url: 'https://erick-aguilar-ecommerce.herokuapp.com/' + req.query.img.substring(1),
                quantity: parseInt(req.query.unit),
                unit_price: parseInt(req.query.price)
            }
        ],
        external_reference: "aguilar505088@gmail.com",
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_81131286@testuser.com",
            phone: {
                area_code: "11",
                number: 22223333
            },
            address: {
                street_name: "Falsa",
                street_number: 123,
                zip_code: "1111"
            }
        },
        back_urls: {
            success: "https://erick-aguilar-ecommerce.herokuapp.com/success",
            pending: "https://erick-aguilar-ecommerce.herokuapp.com/pending",
            failure: "https://erick-aguilar-ecommerce.herokuapp.com/failure",
        },
        payment_methods: {
            excluded_payment_methods: [{ id: "amex" }],
            excluded_payment_types: [{ id: "atm" }],
            installments: 6,
            default_installments: 6,
        },
        notification_url: "https://erick-aguilar-ecommerce.herokuapp.com/webhook",
        auto_return: "approved",
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {
            console.log("respondio mercado");
            console.log(response);
            id = response.body.id;
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            req.query.globalID = response.body.id;
            req.query.id = response.body.id;
            req.query.init_point = response.body.init_point;
            console.log(`redirigir a ${response.body.init_point}`)
            res.render('detail', req.query);
        }).catch(function (error) {
            console.log("entra al catch: error")
            console.log(error);
            res.render('failure', req.query);
        });
});

app.get('/success', function (req, res) {
    const data = getMercadoResponseInfo(req);
    res.render('success', data);
});

app.get('/pending', function (req, res) {
    const data = getMercadoResponseInfo(req);
    res.render('pending', data);
});

app.get('/failure', function (req, res) {
    const data = getMercadoResponseInfo(req);
    res.render('failure', data);
});

app.post('/webhook', function (req, res) {
    console.log('BODY : ', JSON.stringify(req.body));
    console.log(req.query);
    res.status(200).send();
});
app.listen(port);