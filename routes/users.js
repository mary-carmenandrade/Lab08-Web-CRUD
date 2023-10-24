const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String, 
  password: String,
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users, errors: [] });
});

router.post(
  '/',
  [
    check('name', 'Por favor, elije un nombre de usuario.').notEmpty(),
    check('email', 'Por favor, elije un nombre de usuario.').isEmail(),
    check('password', ' Proporciona una contraseña válida (6 digitos).').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('index', { errors: errors.array() });
    }

    const saltRounds = 10;

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      await newUser.save();
      res.redirect('/users');
    } catch (error) {
      res.status(500).send('Error al guardar el usuario');
    }
  }
);


router.get('/edit/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.render('partials/edit', { user });
    } catch (error) {
      res.status(500).send('Error al cargar la página de edición');
    }
  });
  

router.post('/update/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/users');
  } catch (error) {
    res.status(500).send('Error al actualizar el usuario');
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/users');
  } catch (error) {
    res.status(500).send('Error al eliminar el usuario');
  }
});

module.exports = router;
