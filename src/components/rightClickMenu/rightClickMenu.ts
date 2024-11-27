import { RightClickMenuConfig } from "../../core/pluginSDK/plugin.sdk.interface";
import './rightClickMenu.css';
let menuCount = 0;

export const createRightClickMenu = (event: any, options: RightClickMenuConfig) => {
    event.preventDefault();
    const [mouseX, mouseY] = [event.clientX, event.clientY];


    // Create context menu div element
    const contextMenu = document.createElement('div');

    contextMenu.id = 'contextMenu:' + menuCount++;
    contextMenu.className = 'context-menu';
    contextMenu.style.left = mouseX + 'px';
    contextMenu.style.top = mouseY + 'px';
    console.log('HERE',  options.choices)
    options.choices.forEach((choice)=>{
        if(choice.hide) return;
        console.log('H#ERE',  choice)

        const option = document.createElement('div');
        option.className = 'context-menu-option';
        option.style.cursor = 'pointer';

        const label =  document.createElement('div');
        label.style.paddingRight = '10px'
        label.textContent = choice.name;

        
        option.appendChild(label);
        const inputs = choice.inputFields?.map((name)=>{
            const input = document.createElement('input');
            option.appendChild(input);
            return input;
        });

        label.addEventListener('click', function(e) {
            // Add your "Add" logic here
            if(choice.callBack) {
                choice.callBack(e, ...inputs?.map(({value})=>value) || []);
                contextMenu.remove(); 
            }
            if(choice.expand) {
                createRightClickMenu(e, choice.expand);
            }
        });
        
        
        
        contextMenu.appendChild(option);
    });

    document.addEventListener('click', function(e) {
        if (e.target !== contextMenu && !contextMenu.contains(e.target as Node) && document.body.contains(contextMenu)) {
          contextMenu.remove();          
        }
    });

    event.stopPropagation();
    console.log('THERE',  options.choices)
    document.body.appendChild(contextMenu);
    return contextMenu;
    
}
