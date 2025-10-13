//підєднюємо фрагмент бібліотеки 
const { Command } = require('commander');
const { argon2 } = require('crypto');
const komandu = new Command();
const fs = require('fs');//для роботи з файловою системою



//додаємо параметри чкі може зможемо приймати 
komandu
.requiredOption('-i, --input <path>', 'шлях до файлу, який будемо читати')
.option('-o, --output <path>', 'шлях до файлу, у який ми хочемо записати інфу')
.option('-d, --display','якшо задав того параметра, то виведе в консоль')
.option('-a, --age', 'додати вік пасажира у вивід')
.option('-s, --survived', 'показати лише пасажирів, які вижили')
.configureOutput({
  outputError: (str, write) => {//функція яка викликається при помилці 
    // Помилка, якщо не вказано -i
    if (str.includes("option '-i, --input <path>'")) {
      write('Ти не задав input або не вказав шлях до файлу\n');
    } else if(str.includes("option '-o, --output <path>'"))
      {
      write('Ти не задав output або не вказав шлях до файлу\n');
    }
    else {
      write(`Error: ${str}\n`);
    }
  }
});



//парсить команди з командного радяка. process.argv — це масив усіх аргументів командного рядка 
komandu.parse(process.argv);

//отримує значення у вигляді об’єкта 
const args = komandu.opts();


// Перевірка існування файлу
if (!fs.existsSync(args.input)) {
  console.error("Не годен найти такого файлу"); // кастомна помилка, якщо файлу нема
  process.exit(1);
}

// читаємо JSON файл і зберігає у вигляді тексту 
let dataRaw = fs.readFileSync(args.input, 'utf-8');

// масив обєктів
let data = JSON.parse(dataRaw); 

// фільтрація — якщо задано -s, показуємо лише тих, хто вижив
if (args.survived) {
  data = data.filter(p => p.Survived === '1');//повертає тільки ті поля, для яких умова виконується 
}


// формуємо масив рядків для виводу
const result = data.map(p => {
  let line = `Name: ${p.Name}, Ticket: ${p.Ticket}`;
  if (args.age && p.Age !== undefined && p.Age !== '') {
    line += `, Age: ${p.Age}`;
  }
  return line;
});

// перетворюємо на форматований JSON рядок
const outputJSON = JSON.stringify(result, null, 2);

// вивід у консоль, якщо задано -d
if (args.display) {
  console.log(outputJSON);
}

// запис у файл, якщо задано -o
if (args.output) {
  fs.writeFileSync(args.output, outputJSON, 'utf-8');
}