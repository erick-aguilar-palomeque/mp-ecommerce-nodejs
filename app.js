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

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
});

app.get('/pending', function (req, res) {
    res.render('pending', req.query);
});

app.get('/failure', function (req, res) {
    res.render('failure', req.query);
});



app.post('/checkout', function (req, res) {
    console.log('info==>')
    console.log(req.body);
    const { title, unit, price, img } = req.body;

    // Crea un objeto de preferencia
    let preference = {
        items: [
            {
                id: "1234",
                title,
                description: 'Teléfono de tienda e-commerce',
                quantity: parseInt(unit),
                unit_price: parseInt(price)
            }
        ],
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
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            // global.id = response.body.id;
        }).catch(function (error) {
            console.log(error);
        });


    //res.render('home');

    // res.render('detail', req.query);
});

app.listen(port);