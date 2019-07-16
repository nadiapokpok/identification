/*installation d'express*/
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile('auth.html', { root : __dirname}));

const port = process.env.PORT || 3002;
app.listen(port , () => console.log('App listening on port ' + port));

/* installation  de passport */
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

/* installation de mongoose
1)ns ns connectons à notre base de données en utilisant mongoose connect et nous lui donnons 
1 chemin vers notre base de données.
2)on utilise schema pour définir notre structure de données.Ici on crée 1 schema UserDetail
avec username et password.
3)on crée1 modèle à partir de ce schéma avec:
1er paramètre = nom de la collection ds la base de données
2ème paramètre = réf à notre schéma
3ème paramètre = nom qu'on assigne à la collection à l'intérieur de mongoose*/

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MyDatabase');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/*Passepport local authentification
D'abord, nous exigeons le passport-local Strategy . Ensuite, nous indiquons à Passport d’utiliser
une instance de LocalStrategy ce dont nous avons besoin. Là, nous utilisons simplement
la même commande que nous avons utilisée dans le shell Mongo pour trouver un enregistrement
basé sur le nom d'utilisateur. Si un enregistrement est trouvé et que le mot de passe
correspond, le code ci-dessus renvoie l' objet user. Sinon, il revient false.
En dessous l’implementation de la stratégie, il y a notre post, avec la méthode
[passport.authenticate](http://www.passportjs.org/docs/authenticate/) qui tente
de s'authentifier avec la stratégie donnée sur son premier paramètre, dans le cas .
'local' Il nous redirigera vers '/error' si cela échoue. Sinon, il nous redirigera
vers la route '/success', en envoyant le nom d'utilisateur en tant que paramètre.
Cela ns permet d'afficher le nom d'utilisateur sur la ligne req.query.username.
A présent l'appli fonctionne*/

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.username);
  });