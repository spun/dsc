import './popup.css';

interface PopupElementData {
  title: string;
  subtitle: string;
  url: string;
}


// Main box
function createPopupBox() {
  // UI box
  const popup = document.createElement('div');
  popup.classList.add('card');
  return popup;
}

// Box header
function createPopupHeader(popup: Popup) {
  // Header
  const header = document.createElement('p');
  header.classList.add('header');
  // Header title
  const headerTitle = document.createElement('span');
  headerTitle.textContent = 'Available formats';
  headerTitle.classList.add('title');
  headerTitle.onclick = () => popup.restore();
  header.appendChild(headerTitle);
  // Minimize button
  const headerMinimize = document.createElement('span');
  headerMinimize.classList.add('minimize-popup-button');
  headerMinimize.textContent = '_';
  headerMinimize.onclick = () => popup.toggle();
  header.appendChild(headerMinimize);
  // Close button
  const headerClose = document.createElement('span');
  headerClose.classList.add('close-popup-button');
  headerClose.textContent = 'X';
  headerClose.onclick = () => popup.hide();
  header.appendChild(headerClose);

  return header;
}

// Box list
function createPopupList() {
  // Box list
  const list = document.createElement('ul');
  list.classList.add('list');
  return list;
}

// Box list item
function createPopupListItem(titleText: string, subtitleText: string, url: string) {
  // Item
  const listItem = document.createElement('li');
  listItem.classList.add('list-item');
  // Link wrapper
  const link = document.createElement('a');
  link.href = url;
  listItem.appendChild(link);
  // Item title
  const title = document.createElement('p');
  title.classList.add('title');
  title.textContent = titleText;
  link.appendChild(title);
  // Item subtitle
  const subTitle = document.createElement('p');
  subTitle.classList.add('subtitle');
  subTitle.textContent = subtitleText;
  link.appendChild(subTitle);

  return listItem;
}

// Popup class
class Popup {
  boxId: string;
  boxElement: HTMLDivElement
  headerElement: HTMLParagraphElement
  listElement: HTMLUListElement
  clickListener: (data: PopupElementData) => void;

  constructor(clickListener: (data: PopupElementData) => void) {
    this.boxId = 'dsc_popup';
    // Create main box and attach to body
    this.boxElement = createPopupBox();
    this.boxElement.id = this.boxId;
    // Create header and attach to box
    this.headerElement = createPopupHeader(this);
    this.boxElement.appendChild(this.headerElement);
    // Create items list and attach to box
    this.listElement = createPopupList();
    this.boxElement.appendChild(this.listElement);
    // Notify click events
    this.clickListener = clickListener;
  }

  // Create and add a new list item to the box list
  addItemToList(data: PopupElementData) {
    const li = createPopupListItem(data.title, data.subtitle, data.url);
    li.onclick = () => {
      this.clickListener(data);
      // Prevent navigation. We do this instead of removing the link element
      // in case the user wants to open the element url in a new tab.
      return false;
    };
    this.listElement.appendChild(li);
  }

  // Add box to DOM
  show() {
    this.hide();
    document.body.appendChild(this.boxElement);
  }

  // Remove box from DOM
  hide() {
    const popupElement = document.getElementById(this.boxId);
    if (popupElement != null) {
      const parent = popupElement.parentElement;
      if (parent) {
        parent.removeChild(popupElement);
      }
    }
  }

  // Add "minimize" class to show only the box header
  minimize() {
    this.boxElement.classList.add('minimize');
  }

  // Remove "minimize" class to show all the content of the box
  restore() {
    this.boxElement.classList.remove('minimize');
  }

  toggle() {
    if (this.boxElement.classList.contains('minimize')) {
      this.restore();
    } else {
      this.minimize();
    }
  }
}

export { Popup, PopupElementData };
