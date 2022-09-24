document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const bookshelfs = [];
const RENDER_EVENT = "render-bookshelf";

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookshelfs = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookshelfs.innerHTML = "";

  const completedBookshelfs = document.getElementById("completeBookshelfList");
  completedBookshelfs.innerHTML = "";

  let completeCount = 0;
  let incompleteCount = 0;
  for (const book of bookshelfs) {
    let count = book.bookIsComplete ? ++completeCount : ++incompleteCount;
    const bookElement = makeBookElement(count, book);
    if (!book.bookIsComplete) uncompletedBookshelfs.append(bookElement);
    else completedBookshelfs.append(bookElement);
  }

  if (!completeCount) {
    const completeColoumn = document.createElement("td");
    completeColoumn.classList.add("text-center");
    completeColoumn.innerText =
      "Belum ada buku yang ditambahkan ke rak selesai dibaca";
    completeColoumn.setAttribute("colspan", "5");

    const completeRow = document.createElement("tr");
    completeRow.append(completeColoumn);

    completedBookshelfs.append(completeRow);
  }

  if (!incompleteCount) {
    const incompleteColoumn = document.createElement("td");
    incompleteColoumn.classList.add("text-center");
    incompleteColoumn.innerText =
      "Belum ada buku yang ditambahkan ke rak belum selesai dibaca.";
    incompleteColoumn.setAttribute("colspan", "5");

    const incompleteRow = document.createElement("tr");
    incompleteRow.append(incompleteColoumn);

    uncompletedBookshelfs.append(incompleteRow);
  }
});

function makeBookElement(number, bookObject) {
  const countBook = document.createElement("td");
  countBook.innerText = number;

  const bookTitle = document.createElement("th");
  bookTitle.innerText = bookObject.bookTitle;

  const bookAuthor = document.createElement("td");
  bookAuthor.innerText = bookObject.bookAuthor;

  const bookYear = document.createElement("td");
  bookYear.innerText = bookObject.bookYear;

  const bookAction = document.createElement("td");

  if (bookObject.bookIsComplete) {
    const uncheckIcon = document.createElement("i");
    uncheckIcon.classList.add("fa-regular", "fa-circle-xmark");

    const undoButton = document.createElement("button");
    undoButton.classList.add("btn", "btn-sm", "btn-warning");
    undoButton.append(uncheckIcon);
    undoButton.append(document.createTextNode(" Belum Selesai Dibaca"));

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    bookAction.append(undoButton);
  } else {
    const iconCheck = document.createElement("i");
    iconCheck.classList.add("fa-regular", "fa-circle-check");

    const checkButton = document.createElement("button");
    checkButton.classList.add("btn", "btn-sm", "btn-success");
    checkButton.append(iconCheck);
    checkButton.append(document.createTextNode(" Selesai Dibaca"));

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    bookAction.append(checkButton);
  }
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa", "fa-trash");

  const trashButton = document.createElement("button");
  trashButton.classList.add("btn", "btn-sm", "btn-danger");
  trashButton.append(trashIcon);
  trashButton.append(document.createTextNode(" Hapus Buku"));

  trashButton.addEventListener("click", function () {
    removeBookFromBookshelf(bookObject.id);
  });
  bookAction.append(" ");
  bookAction.append(trashButton);

  const bookRow = document.createElement("tr");
  bookRow.classList.add("book_item");
  bookRow.append(
    countBook,
    bookTitle,
    bookAuthor,
    bookYear,
    bookAction,
    bookAction
  );
  bookRow.setAttribute("id", `book-${bookObject.id}`);

  return bookRow;
}

//   ===========================================================================

function searchBook() {
  const searchBook = document.getElementById("searchBookTitle").value;
  const bookshelfs = document.querySelectorAll(".book_item");
  for (const bookshelf of bookshelfs) {
    const bookTitle = bookshelf.querySelector("th").innerText;

    if (bookTitle.toLowerCase().includes(searchBook.toLowerCase())) {
      bookshelf.style.display = "table-row";
    } else {
      bookshelf.style.display = "none";
    }
  }
}

function generateId() {
  return +new Date();
}

function generateBookshelfObject(
  id,
  bookTitle,
  bookAuthor,
  bookYear,
  bookIsComplete
) {
  return {
    id,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete,
  };
}

//  ===========================================================================

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookshelfObject = generateBookshelfObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );
  bookshelfs.push(bookshelfObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.bookIsComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  toast("Buku berhasil dipindahkan ke rak selesai dibaca!");
  saveData();
}

function removeBookFromBookshelf(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  bookshelfs.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  toast("Buku berhasil dibuang dari rak!");
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.bookIsComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  toast("Buku dipindahkan ke rak belum selesai dibaca!");
  saveData();
}

//   ===========================================================================

function findBook(bookId) {
  for (const book of bookshelfs) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookshelfs) {
    if (bookshelfs[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

//  ========================== LOCAL STORAGE =================================

const STORAGE_KEY = "BOOKSHELF_APPS";

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelfs);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelfs.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function toast(text) {
  let x = document.createElement("div");
  x.innerText = text;
  x.classList.add("snackbar");
  document.body.append(x);
  x.classList.add("show");
  setTimeout(function () {
    x = x.remove();
  }, 2000);
}
