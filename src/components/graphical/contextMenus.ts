let menuCount = 0;

export const customContextMenu = (event: any, options: {
    [key:string]: [(...args:any[])=>boolean| undefined,any];
}, father?: HTMLDivElement) => {
    event.preventDefault();
    
    // Get mouse coordinates
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    console.log(mouseX, mouseY);
    // Create context menu div element
    let contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu:' + menuCount++;
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = mouseX + 'px';
    contextMenu.style.top = mouseY + 'px';
    contextMenu.style.backgroundColor = '#fff';
    contextMenu.style.padding = '5px';
    contextMenu.style.border = '1px solid #000';

    for(const optionName in options) {
        if(options[optionName][1]?.hide) {
            continue;
        }
        let option = document.createElement('div');
        let label =  document.createElement('div');
        let input: HTMLInputElement;
        let input2: HTMLInputElement;
        
        label.style.paddingRight = '10px'
        label.style.paddingRight = '10px'
        option.className = 'context-menu-option';
        label.textContent = optionName;
        option.style.cursor = 'pointer';
        label.addEventListener('click', function(e) {
            // Add your "Add" logic here
            const toStay = options[optionName][0]({e, input: input?.value, input2: input2?.value});
            if(!toStay) {
                contextMenu.remove(); // Remove context menu after option is clicked
            }
        });
        option.appendChild(label);
        if(options[optionName][1]?.addInputField) {
            input = document.createElement('input');
            option.appendChild(input);

        }
        if(options[optionName][1]?.addInputField2) {
            input2 = document.createElement('input');
            option.appendChild(input2);

        }
        
        
        contextMenu.appendChild(option);
    }
   
    document.addEventListener('click', function(e) {

        if (e.target !== contextMenu && !contextMenu.contains(e.target as Node) && document.body.contains(contextMenu)) {
          contextMenu.remove();          
        }
    });
    // Add context menu to DOM
    event.stopPropagation();
    document.body.appendChild(contextMenu);
    return contextMenu;
  }