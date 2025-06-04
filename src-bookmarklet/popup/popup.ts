import './popup.css';

interface PopupItem {
  headlineText: string;
  supportingText: string;
  onClick: () => void;
}

type PopupState =
  | { type: 'Loading' }
  | { type: 'Success'; list: PopupItem[] }
  | { type: 'Error'; message: string };

// Popup class
class Popup {

  rootId: string = 'dsc_popup';
  private root: HTMLDivElement;
  private listElement: HTMLUListElement;

  constructor(
    primaryColor = '#FF00FF',
    onPrimaryColor = '#FF00FF'
  ) {
    // Main box
    this.root = document.createElement('div');
    this.root.id = this.rootId;
    this.root.style.setProperty('--dsc-color-primary', primaryColor);
    this.root.style.setProperty('--dsc-color-on-primary', onPrimaryColor);
    this.root.setAttribute('role', 'dialog');

    // Header
    const header = document.createElement('p');
    header.classList.add('header');
    // Header title
    const headerTitle = document.createElement('button');
    headerTitle.textContent = 'Available formats';
    headerTitle.classList.add('title');
    headerTitle.addEventListener('click', () => this.restore());
    headerTitle.setAttribute('aria-label', 'Restore popup');
    header.appendChild(headerTitle);
    // Minimize button
    const headerMinimize = document.createElement('button');
    headerMinimize.classList.add('minimize-popup-button');
    headerMinimize.textContent = '▬';
    headerMinimize.addEventListener('click', () => this.toggle());
    headerMinimize.setAttribute('aria-label', 'Minimize popup');
    header.appendChild(headerMinimize);
    // Close button
    const headerClose = document.createElement('button');
    headerClose.classList.add('close-popup-button');
    headerClose.textContent = '✖';
    headerClose.addEventListener('click', () => this.remove());
    headerClose.setAttribute('aria-label', 'Close popup');
    header.appendChild(headerClose);

    this.root.appendChild(header)

    // Create items list and attach to box
    this.listElement = document.createElement('ul');
    this.listElement.classList.add('list');
    this.root.appendChild(this.listElement);
  }

  setState(state: PopupState) {
    switch (state.type) {
      case 'Loading':
        // Show loading
        this.showLoader()
        break;
      case 'Success':
        // Show list
        this.setItems(state.list)
        break;
      case 'Error':
        // Show error
        this.showError(state.message)
        break;
    }
  }

  private clearList() {
    while (this.listElement.firstChild) {
      this.listElement.removeChild(this.listElement.firstChild);
    }
  }

  private setItems(items: PopupItem[]): void {
    // Remove all items from list first
    this.clearList()

    // Add new items
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const listItem = Popup.createListItem(item)
      fragment.appendChild(listItem);
    })
    this.listElement.appendChild(fragment);
  }

  private showLoader(): void {
    // Remove all items from list first
    this.clearList()
    const loader = document.createElement('div');
    loader.className = 'spinner';
    this.listElement.appendChild(loader);
  }

  private showError(message: string): void {
    // Remove all items from list first
    this.clearList();
    // Create error element
    const error = document.createElement('p');
    error.className = 'error-message';
    // Create prefix
    const errorPrefix = document.createElement('strong');
    errorPrefix.textContent = 'Error: ';
    // Add error message
    const messageNode = document.createTextNode(message);
    // Append everything 
    error.appendChild(errorPrefix);
    error.appendChild(messageNode);
    this.listElement.appendChild(error);
  }

  // Add box to DOM
  show(): void {
    this.remove();
    document.body.appendChild(this.root);
  }

  // Remove box from DOM
  remove(): void {
    const popupElement = document.getElementById(this.rootId);
    if (!popupElement || !popupElement.parentElement) return;
    popupElement.parentElement.removeChild(popupElement);
  }

  // Add "minimize" class to show only the box header
  minimize(): void {
    this.root.classList.add('minimized');
  }

  // Remove "minimize" class to show all the content of the box
  restore(): void {
    this.root.classList.remove('minimized');
  }

  toggle(): void {
    if (this.root.classList.contains('minimized')) {
      this.restore();
    } else {
      this.minimize();
    }
  }

  private static createListItem(item: PopupItem): HTMLLIElement {
    // Item
    const listItem = document.createElement('li');
    listItem.classList.add('list-item');
    // Link wrapper
    const link = document.createElement('a');
    link.onclick = item.onClick
    listItem.appendChild(link);
    // Item title
    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = item.headlineText;
    link.appendChild(title);
    // Item subtitle
    const subTitle = document.createElement('p');
    subTitle.classList.add('subtitle');
    subTitle.textContent = item.supportingText;
    link.appendChild(subTitle);
    return listItem
  }
}

export { Popup, PopupItem };
