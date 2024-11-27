export const getCentre = (circle: fabric.Circle): [number, number] => {
    let { tl, br } = circle.calcCoords();
    const z = circle.canvas!.getZoom()!;
    return [
        (tl.x/z + br.x/z) / 2,
        (tl.y/z + br.y/z) / 2
    ]
}