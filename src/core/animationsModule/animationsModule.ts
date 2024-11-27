
const INTERVAL_BETWEEN_CHANGES = 30;

let animations: Animation[] = [];

export interface Animation {
    onStart(): void;
    onCycle(): boolean;
    onEnd(): void;
}

const addAnimation = (animation: Animation)=>{
    animations.push(animation);
    animation.onStart();
}

const stopAnimation = (animation: Animation) => {
  animations = animations.filter((_animation) => _animation != animation);
};

const init = ():any=>{
    setInterval(() => {
        animations.forEach((animation)=>{
            const toStop = animation.onCycle();
            if(toStop) animation.onEnd();
            animations = animations.filter(
              (_animation) => _animation != animation
            );
        })
    }, INTERVAL_BETWEEN_CHANGES);

}

init();

export default {
  addAnimation,
  stopAnimation,
  init,
};
