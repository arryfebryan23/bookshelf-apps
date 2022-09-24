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

  for (const book of bookshelfs) {
    const bookElement = makeBookElement(book);
    if (!book.bookIsComplete) uncompletedBookshelfs.append(bookElement);
    else completedBookshelfs.append(bookElement);
  }
});

function makeBookElement(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.bookTitle;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.bookAuthor;

  const bookYear = document.createElement("p");
  bookYear.innerText = bookObject.bookYear;

  const bookContainer = document.createElement("article");
  bookContainer.classList.add("book_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear);
  bookContainer.setAttribute("id", `book-${bookObject.id}`);

  const containerAction = document.createElement("div");
  containerAction.classList.add("action");

  if (bookObject.bookIsComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum Selesai Dibaca";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    containerAction.append(undoButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai Dibaca";

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    containerAction.append(checkButton);
  }

  const trashButton = document.createElement("button");
  trashButton.classList.add("red");
  trashButton.innerText = "Hapus Buku";

  trashButton.addEventListener("click", function () {
    removeBookFromBookshelf(bookObject.id);
  });

  containerAction.append(trashButton);

  bookContainer.append(containerAction);

  return bookContainer;
}

//   ===========================================================================

function searchBook() {
  const searchBook = document.getElementById("searchBookTitle").value;
  const bookshelfs = document.querySelectorAll(".book_item");
  for (const bookshelf of bookshelfs) {
    const bookTitle = bookshelf.querySelector("h3").innerText;
    if (bookTitle.toLowerCase().includes(searchBook.toLowerCase())) {
      bookshelf.style.display = "block";
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
