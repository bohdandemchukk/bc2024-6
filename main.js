const express = require('express');
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const multer = require('multer');
const { swaggerUi, specs } = require('./swagger');

const mlt = multer();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cachePath>', 'cache directory');
program.parse(process.argv);

const options = program.opts();
const lab5 = express();
lab5.use(express.json());
lab5.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

/** 
 * @swagger
 * /notes/{note_name}:
 *   get:
 *     summary: Отримати нотатку за іменем
 *     parameters:
 *       - in: path
 *         name: note_name
 *         required: true
 *         description: Назва нотатки
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успішне отримання нотатки
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Нотатку не знайдено
 */
lab5.get('/notes/:note_name', (req, res) => {
  const pathToNote = path.join(options.cache, `${req.params.note_name}.txt`);
  fs.readFile(pathToNote, 'utf-8', (err, data) => {
    if (err) {
      return res.status(404).send('Not found');
    }
    res.send(data);
  });
});

/**
 * @swagger
 * /notes/{note_name}:
 *   put:
 *     summary: Оновити нотатку за іменем
 *     parameters:
 *       - in: path
 *         name: note_name
 *         required: true
 *         description: Назва нотатки
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Текст для оновлення нотатки
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Нотатку оновлено
 *       404:
 *         description: Нотатку не знайдено
 */
lab5.put('/notes/:note_name', (req, res) => {
  const pathToNote = path.join(options.cache, `${req.params.note_name}.txt`);
  fs.access(pathToNote, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Not found');
    }
    fs.writeFile(pathToNote, req.body.text, (err) => {
      if (err) throw err;
      res.send('Updated');
    });
  });
});

/**
 * @swagger
 * /notes/{note_name}:
 *   delete:
 *     summary: Видалити нотатку за іменем
 *     parameters:
 *       - in: path
 *         name: note_name
 *         required: true
 *         description: Назва нотатки
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Нотатку видалено
 *       404:
 *         description: Нотатку не знайдено
 */
lab5.delete('/notes/:note_name', (req, res) => {
  const pathToNote = path.join(options.cache, `${req.params.note_name}.txt`);
  fs.unlink(pathToNote, (err) => {
    if (err) {
      return res.status(404).send('Not found');
    }
    res.send('Deleted');
  });
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Отримати всі нотатки
 *     responses:
 *       200:
 *         description: Успішне отримання списку нотаток
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   text:
 *                     type: string
 *       500:
 *         description: Внутрішня помилка сервера
 */
lab5.get('/notes', (req, res) => {
  fs.readdir(options.cache, (err, files) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    const notes = files
      .filter((file) => file.endsWith('.txt'))
      .map((file) => {
        const data = fs.readFileSync(path.join(options.cache, file), 'utf-8');
        return { name: path.basename(file, '.txt'), text: data };
      });
    res.json(notes);
  });
});

/**
 * @swagger
 * /write:
 *   post:
 *     summary: Створити нову нотатку
 *     requestBody:
 *       required: true
 *       description: Дані для створення нотатки
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note_name:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Нотатку створено
 *       400:
 *         description: Нотатка з такою назвою вже існує
 */
lab5.post('/write', mlt.none(), (req, res) => {
  const pathToNote = path.join(options.cache, `${req.body.note_name}.txt`);
  fs.access(pathToNote, fs.constants.F_OK, (err) => {
    if (!err) {
      return res.status(400).send('Note already exists');
    }
    fs.writeFile(pathToNote, req.body.note, (err) => {
      if (err) throw err;
      res.status(201).send('Created');
    });
  });
});

/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Отримати форму для завантаження нотаток
 *     responses:
 *       200:
 *         description: Форма успішно отримана
 */
lab5.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

lab5.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
