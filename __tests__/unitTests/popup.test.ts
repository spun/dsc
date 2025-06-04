import { Popup, PopupItem } from '../../src-bookmarklet/popup/popup';

describe('Popup', () => {
    let popup: Popup;

    beforeEach(() => {
        document.body.innerHTML = ''; // Reset DOM
        popup = new Popup('#000000', '#FFFFFF');
    });

    test('should add itself to the DOM show is called', () => {
        const elementBefore = document.getElementById(popup.rootId);
        expect(elementBefore).toBeNull();
        popup.show();
        const elementAfter = document.getElementById(popup.rootId);
        expect(elementAfter).not.toBeNull();
    });

    test('should remove itself from the DOM when removed', () => {
        popup.show();
        popup.remove();
        const element = document.getElementById(popup.rootId);
        expect(element).toBeNull();
    });

    test('should remove itself from the DOM when close button is clicked', () => {
        popup.show();
        // Find the close button
        const closeButton = document.querySelector('.close-popup-button') as HTMLButtonElement;
        expect(closeButton).not.toBeNull();
        // Click the close button
        closeButton.click();
        // Check that the popup has been removed
        const removed = document.getElementById(popup.rootId);
        expect(removed).toBeNull();
    });

    test('should toggle minimize state when toggle is called', () => {
        popup.show();
        // Check that is not currently minimized
        let element = document.getElementById(popup.rootId);
        expect(element).not.toBeNull();
        expect(element!.classList.contains('minimized')).toBe(false);
        // Toggle to minify and check the expected minified class is added
        popup.toggle();
        element = document.getElementById(popup.rootId);
        expect(element!.classList.contains('minimized')).toBe(true);
        // Toggle to restore and check the minified class has been removed
        popup.toggle();
        element = document.getElementById(popup.rootId);
        expect(element!.classList.contains('minimized')).toBe(false);
    });

    test('should only display loading spinner on loading state', () => {
        popup.show();
        popup.setState({ type: 'Loading' });
        // Check if spinner is being displayed
        const spinner = document.querySelector('.spinner');
        expect(spinner).not.toBeNull();
        // Check that no other elements are in the list
        const listItems = document.querySelectorAll('.list-item');
        expect(listItems.length).toBe(0);
        // Check that error from Error state is not displayed
        const error = document.querySelector('.error-message');
        expect(error).toBeNull();
    });

    test('should only display error message on error state', () => {
        popup.show();
        const errorMessage = 'Something went wrong';
        popup.setState({ type: 'Error', message: errorMessage });
        // Check that the error element exists
        const errorElement = document.querySelector('.error-message') as HTMLParagraphElement;
        expect(errorElement).not.toBeNull();
        // Check the full text content
        expect(errorElement.textContent).toBe(`Error: ${errorMessage}`);
        // Check that no other elements are in the list
        const listItems = document.querySelectorAll('.list-item');
        expect(listItems.length).toBe(0);
        // Check that spinner from Loading state is not displayed
        const spinner = document.querySelector('.spinner');
        expect(spinner).toBeNull();
    });

    test('should only display a list of items on success state', () => {
        popup.show();
        // Populate popup
        popup.setState({
            type: 'Success',
            list: [
                {
                    headlineText: 'Item 1',
                    supportingText: 'Details about item 1',
                    onClick: jest.fn(),
                },
            ],
        });
        // Check if list elements are being displayed
        const listItems = document.querySelectorAll('.list-item');
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toContain('Item 1');
        // Check that spinner from Loading state is not displayed
        const spinner = document.querySelector('.spinner');
        expect(spinner).toBeNull();
        // Check that error from Error state is not displayed
        const error = document.querySelector('.error-message');
        expect(error).toBeNull();
    });

    test('should call onClick when list item is clicked', () => {
        popup.show();
        const handleClick = jest.fn();
        // Populate popup
        popup.setState({
            type: 'Success',
            list: [
                {
                    headlineText: 'Title',
                    supportingText: 'Subtitle',
                    onClick: handleClick,
                },
            ],
        });

        const item = document.querySelector('.list-item a') as HTMLAnchorElement;
        expect(item).not.toBeNull();
        item.click();
        expect(handleClick).toHaveBeenCalled();
    });
});