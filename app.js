//note to self: do NOT update directly on the inputs of any functions
//that will change the original input for some ungodly reason
//19/8/2023: the rotate bug has been fixed, rotate now works for all distances
const objData = analizeMap(map, 4000, 4000, 4000, playerPos1, wallcolor)

//z positive is towards the screen
var sceneData = {
    playerPos : [0, 0, 0],
    camNormal : [0, 0, -1],
    defaultNormal : [0, 0, 1],
    respectiveCamNormal: [0, 0, -1],
    falloffZ: 800, //use to calculate when the darkened gradient starts  
    objects : objData
}

var mx = 0;
var my = 0;
const framerate = 30;

var wasd = [0, 0, 0, 0]
var arrow = [0, 0, 0, 0] //up left down right (same direction as wasd)

function init() {
    setPerspective(850, null, null)
    spawnAllObject(sceneData.camNormal, sceneData.objects)

    window.onmousemove = (event) => {
        mx = event.x - window.visualViewport.width/2
        my = event.y - window.visualViewport.height/2
        setPerspective(850, window.visualViewport.width - event.x, window.visualViewport.height - event.y)   
    }
    
    window.onkeydown = (event) => {
        console.log(event.key)
        switch(event.key){
            case 'w': 
                wasd[0] = 1;
                break;
            case 'a':
                wasd[1] = 1;
                break;
            case 's':
                wasd[2] = 1;
                break;
            case 'd':
                wasd[3] = 1;
                break;
            case 'ArrowUp':
                arrow[0] = 1;
                break;
            case 'ArrowLeft':
                arrow[1] = 1;
                break;
            case 'ArrowDown':
                arrow[2] = 1;
                break;
            case 'ArrowRight':
                arrow[3] = 1;
                break;
        }
    }

    window.onkeyup = (event) => {
        switch(event.key){
            case 'w': 
                wasd[0] = 0;
                break;
            case 'a':
                wasd[1] = 0;
                break;
            case 's':
                wasd[2] = 0;
                break;
            case 'd':
                wasd[3] = 0;
                break;
            case 'ArrowUp':
                arrow[0] = 0;
                break;
            case 'ArrowLeft':
                arrow[1] = 0;
                break;
            case 'ArrowDown':
                arrow[2] = 0;
                break;
            case 'ArrowRight':
                arrow[3] = 0;
                break;
        }
    }

    var d = 0
    setInterval(() => {
        var diff = Math.abs(mx)
        if(diff > 700){
            //d += 5 * Math.sign(mx)
            //rotateScene(sceneData, [0, -1, 0], [0, 0, 0], d)
        }
        
        var v = inputToVector(wasd)
        var v2 = inputToVector(arrow)
        //var v3 = inputToVector(wasd, sceneData.respectiveCamNormal)
        if(!(v[0] == 0 && v[1] == 0 && v[2] == 0)){
            var distance = (v[2] == 1) ? 1200 : 1200
            if(v[0] != 0 && v[2] != 0){
                moveScene(100 * Math.SQRT2, distance, v, [0, 0, 0], sceneData.camNormal)
            } else {
                moveScene(100, distance, v, [0, 0, 0], sceneData.camNormal)
            }            
            //scene.respectiveCamNormal = k
        }

        var deg = 2.6
        if(v2[0] != 0){
            d += deg * v2[0]
            rotateScene(sceneData, [0, -1, 0], [0, 0, 0], deg * v2[0])
            var k = rotateAroundLine(sceneData.respectiveCamNormal, [0, -1, 0], [0, 0, 0], -deg * v2[0])
            sceneData.respectiveCamNormal = k
        }
        
    }, 1000/framerate)
}

function inputToVector(inputArr){
    var final = [0, 0, 0]
    if(inputArr[0] == 1 && inputArr[2] == 0){
        final[2] = -1
    }
    if(inputArr[0] == 0 && inputArr[2] == 1){
        final[2] = 1
    }
    if(inputArr[1] == 1 && inputArr[3] == 0){
        final[0] = -1
    }
    if(inputArr[1] == 0 && inputArr[3] == 1){
        final[0] = 1
    }

    // if(respectiveCamNormal){        
    //     var deg = degBetween2Vector([0, 0, -1], respectiveCamNormal)
    //     var axis = crossProduct([0, 0, -1], respectiveCamNormal)
    //     final = rotateAroundLine(final, axis, [0, 0, 0], deg * -1)
    // }

    return final
}

function snapAngle(angle){
    return (Math.abs(angle) > 550) ? (Math.abs(angle) % 360) * Math.sign(angle) : angle
}

function colorToText(color){
    if(!color || !color.length) return "rgba(0, 0, 0, 0)"

    var red = color[0]
    var green = color[1]
    var blue = color[2]
    var opacity = color[3]

    if(isNaN(red) && isNaN(green) && isNaN(blue) && isNaN(opacity)) opacity = 0;
    else {
        opacity = (isNaN(opacity)) ? 1 : Number(opacity)
    }
    red = (isNaN(red)) ? 0 : Number(red)
    green = (isNaN(green)) ? 0 : Number(green)
    blue = (isNaN(blue)) ? 0 : Number(blue)
    
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function degBetween2Vector(vec1, vec2){
    var a = radToDeg(Math.acos(dotProduct(vec1, vec2) / (Math.hypot(...vec1) * Math.hypot(...vec2))))
    if(isNaN(a)) return 0
    return a
}

function dotProduct (vec1, vec2){
    return (vec1[0] * vec2[0]) + (vec1[1] * vec2[1]) + (vec1[2] * vec2[2])
}

function crossProduct (vec1, vec2){
    return [(vec1[1] * vec2[2]) - (vec1[2] * vec2[1]), (vec1[2] * vec2[0]) - (vec1[0] * vec2[2]), (vec1[0] * vec2[1]) - (vec1[1] * vec2[0])]
}

function radToDeg(x){
    return x * (180 / Math.PI)
}

function degToRad(deg){
    return (Math.PI/180) * deg
}

//round a number to a certain precision
function round(num, precision){ 
return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)
}   

function invert(vec){
    return [-vec[0], -vec[1], -vec[2]]
}

function plus2Vector(vec1, vec2){
    return [vec1[0] + vec2[0], vec1[1] + vec2[1], vec1[2] + vec2[2]]
}

function minus2Vector(vec1, vec2){
    return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]]
}

function normalize(vec){
    var length = Math.hypot(...vec)
    return [vec[0] / length, vec[1] / length, vec[2] / length]
}

function rotate2d(point, pivot, angle) {
    angle = snapAngle(angle)
    if((!point[0] && point[0] != 0) || (!point[1] && point[1] != 0)) {
        throw new Error(`error rotate 2d ${point} around pivot ${pivot} with deg = ${angle}`)
    }
    //rotate couter clockwise
    var x_pivot = pivot[0]
    var y_pivot = pivot[1]
    // Shifting the pivot point to the origin
    // and the given points accordingly
    const x_shifted = point[0] - x_pivot;
    const y_shifted = point[1] - y_pivot;
 
    // Calculating the rotated point co-ordinates
    // and shifting it back
    var a = x_pivot + (x_shifted * Math.cos(degToRad(angle)) - y_shifted * Math.sin(degToRad(angle)));
    var b = y_pivot + (x_shifted * Math.sin(degToRad(angle)) + y_shifted * Math.cos(degToRad(angle)));
    
    if(isNaN(a) || isNaN(b)) console.log(`rotated 2d ${point} around pivot ${pivot} with deg = ${angle} to NaN`)
    return [round(a, 10), round(b, 10)]
}

function getDegClockwise2d(vec1, vec2){
    if(vec1.length == 2) vec1.push(0)
    if(vec2.length == 2) vec2.push(0)
    var unitY = [0, 1, 0]
    var degRes = degBetween2Vector(vec1, vec2)
    var deg1 = degBetween2Vector(vec1, unitY)
    var deg2 = degBetween2Vector(vec2, unitY)
    
    if(vec1[1] >= 0) {
        if(deg2 >= deg1) return degRes;
        else return 360 - degRes        
    } else {
        if(deg2 <= deg1) return degRes;
        else return 360 - degRes
    }
}

function rotateAroundLine(point, lineVec1, linePoint, deg){
    //console.log(`point is ${point}, lineVec is ${lineVec1}, linePoint is ${linePoint}, deg is ${deg}`)
    //var lineVec1 = lineVec.splice()
    if(deg == 0) return point
    //translate the space so that the line goes thru the origin    
    var translateVec = invert(linePoint)
    point = [point[0] + translateVec[0], point[1] + translateVec[1], point[2] + translateVec[2]]
    
    //rotate on the [x z] space so that the the lineVec is straight rightward from the center
    var deg1 = getDegClockwise2d([1, 0], [lineVec1[0], lineVec1[2]])
    var newP = rotate2d([point[0], point[2]], [0, 0], deg1)
    var newL = rotate2d([lineVec1[0], lineVec1[2]], [0, 0], deg1)
    point[0] = newP[0]
    point[2] = newP[1]
    lineVec1[0] = newL[0]
    lineVec1[2] = newL[1]
    //rotate on the [x, y] space so lineVec fits the [0, 1, 0] vector
    var deg2 = getDegClockwise2d([0, 1], [lineVec1[0], lineVec1[1]])
    newP = rotate2d([point[0], point[1]], [0, 0], deg2)
    point[0] = newP[0]
    point[1] = newP[1]
    
    //rotate on the [x, z] space around the [0, 0, 1] vector of given degree
    newP = rotate2d([point[0], point[2]], [0, 0], deg)
    point[0] = newP[0]
    point[2] = newP[1]
    
    //undo the deg2 rotation
    newP = rotate2d([point[0], point[1]], [0, 0], 360 - deg2)
    point[0] = newP[0]
    point[1] = newP[1]
    
    //undo the deg1 rotation
    newP = rotate2d([point[0], point[2]], [0, 0], 360 - deg1)
    point[0] = newP[0]
    point[2] = newP[1]
    
    return plus2Vector(point, linePoint)
}

//since we do -> move the div -> rotate3d it
//the offsets top and left require to keep the center in the desired coors is only a flat 2d translation
//b4 the actual 3d rotate
function spaceCoorToScreenCoor(objData){

    var spacePos = objData.centerPos

    const screenW = window.visualViewport.width/2
    const screenH = window.visualViewport.height/2
    return [spacePos[0] + screenW - objData.width /2, spacePos[1] + screenH - objData.height /2, spacePos[2]]
}

//object related functions
function setPerspective(distance, x, y){
    if (!x) x = window.visualViewport.width / 2;
    if (!y) y = window.visualViewport.height / 2;
    if (!distance) distance = 1000
    document.getElementById('playerCam').style.setProperty('--perspective', distance)
    document.getElementById('playerCam').style.setProperty('--perspectiveX', x)
    document.getElementById('playerCam').style.setProperty('--perspectiveY', y)
}

function spawnObject(id, screen2, objData){
    var datum = spaceCoorToScreenCoor(objData)

    var screenNormal = screen2.slice()
    screenNormal[2] = -1 * screenNormal[2]
    var deg = degBetween2Vector(screenNormal, objData.normal)
    var axis = crossProduct(screenNormal, objData.normal)

    var styleObj = {
        'w': objData.width,
        'h': objData.height,
        'x': datum[0],
        'y': datum[1],
        'z': datum[2],
        'color': colorToText(objData.color),
        'axisx': axis[0],
        'axisy': axis[1],
        'axisz': axis[2],
        'deg': deg,

        'normalx': objData.normal[0],
        'normaly': objData.normal[1],
        'normalz': objData.normal[2],
        'deg2': objData.deg,

        'opacity': easeDown(Math.hypot(...objData.centerPos), 30, 10000, 1, .25)
    }

    var str = ""
    Object.keys(styleObj).forEach(i=> {
        str += `--${i}: ${styleObj[i]}; `
    })
  
    var final = `<div id="${id.toString()}" class="${objData.type.join(" ")}" style="${str}"></div>`
    var a = document.getElementById('playerCam').innerHTML
    a += final
    document.getElementById('playerCam').innerHTML = a
}

function spawnAllObject(screenNormal, arr){
    arr.forEach((i, index) => {
        spawnObject(index, screenNormal, i)
    })
}

function easeDown(x, minRange, maxRange, minValue, maxValue){
    if(x < minRange) return minValue
    if(x > maxRange) return maxValue

    var m1 = minRange
    var m2 = maxRange + 1
    var n1 = minValue
    var n2 = maxValue

    var f = (1/(x - m2) + 1) * (n1 / (1/(m1 - m2) + 1)) + n2
    return f
}

function updateObject(element, screenNormal, objData, except, only){
    var datum = spaceCoorToScreenCoor(objData)

    var screen2 = screenNormal.slice()
    screen2[2] = -1 * screen2[2]
    var deg = degBetween2Vector(screen2, objData.normal)
    var axis = crossProduct(screen2, objData.normal)

    var styleObj = {
        'w': objData.width,
        'h': objData.height,
        'x': datum[0],
        'y': datum[1],
        'z': datum[2],
        'color': colorToText(objData.color),
        'axisx': axis[0],
        'axisy': axis[1],
        'axisz': axis[2],
        'deg': deg,

        'normalx': objData.normal[0],
        'normaly': objData.normal[1],
        'normalz': objData.normal[2],
        'deg2': objData.deg,

        'opacity': easeDown(Math.hypot(...objData.centerPos), 30, 10000, 1, .25)
    }

    if(except){
        except.forEach(i => {
            delete styleObj[i]
        })
    }

    var styleObj2 = {}
    if(only){
        only.forEach(i => {
            styleObj2[i] = styleObj[i]
        })
        styleObj = styleObj2
    }
    
    element.className = objData.type.join(" ")
    Object.keys(styleObj).forEach(i => {
        element.style.setProperty(`--${i}`, styleObj[i])
    })   
}


//not useful
// function updateAllObject(screenNormal, updateFunction){
//     var arr = document.getElementById('playerCam').children
//     for(var i = 0; i < arr.length; i++){
//         var data = contructObjDataFromElement(screenNormal, arr[i])
//         updateObject(arr[i], screenNormal, updateFunction(data))
//     }
// }

function colorStrToArr(str){
    var a = str.split('(')[1].split(')')[0].split(',')
    var arr = []
    a.forEach(i => {arr.push(Number(i))})
    return arr
}

function contructObjDataFromElement(element){

    const screenW = window.visualViewport.width/2
    const screenH = window.visualViewport.height/2
    var w = Number(element.style.getPropertyValue('--w'))
    var h = Number(element.style.getPropertyValue('--h'))
    var x = Number(element.style.getPropertyValue('--x')) + w/2 - screenW
    var y = Number(element.style.getPropertyValue('--y')) + h/2 - screenH
    var z = Number(element.style.getPropertyValue('--z'))
    var color = colorStrToArr(element.style.getPropertyValue('--color'))
    //var axisx = Number(element.style.getPropertyValue('--axisx'))
    //var axisy = Number(element.style.getPropertyValue('--axisy'))
    //var axisz = Number(element.style.getPropertyValue('--axisz'))
    //var deg = Number(element.style.getPropertyValue('--deg'))

    var normalx = Number(element.style.getPropertyValue('--normalx'))
    var normaly = Number(element.style.getPropertyValue('--normaly'))
    var normalz = Number(element.style.getPropertyValue('--normalz'))
    var deg2 = Number(element.style.getPropertyValue('--deg2'))

    var axis = [normalx, normaly, normalz]
    var location = [x, y, z]

    //screenNormal[2] *= -1 
    //ok i feel like i need to explain the following function call
    //1. since we are rotating vectors instead of points, 
    //we can default the vectors to locate at the origin
    //2. the html rotate3d is clockwise(?) since [0, 0, 1] rotate 90 deg is [1, 0, 0] on the axis [0, 1, 0]
    //so the deg need to be negative to rotate counterclockwise
    //var newNormal = rotateAroundLine(screenNormal, axis, [0, 0, 0], -deg)
    return {
        'type': element.className.split(' '),
        'centerPos' : location,
        'normal' : axis, //warning, divs dont have back so invert this and poof, its gone
        'deg': deg2,
        'width': w,
        'height': h,
        'color': color
    }
}

function rotateObject(screenNormal, objData, lineVec, linePoint, deg1){

    var backup = lineVec
    
    var newPos = rotateAroundLine(objData.centerPos, lineVec, linePoint, deg1)

    var newVec = rotateAroundLine(objData.normal, backup, [0, 0, 0], deg1)

    var k = dotProduct(normalize(lineVec), objData.normal)

    if(Math.abs(k) > .97){
        //screenNormal[2] = -1 * screenNormal[2]
        // var vecTest = minus2Vector(newPos, linePoint)
        
        // var k2 = dotProduct(screenNormal, vecTest)
        // if(k2 < 0) vecTest = invert(vecTest)
        // var degTest = degBetween2Vector(screenNormal, vecTest)

        //var except = ['normal', 'deg']
        var deg = objData.deg + deg1 * Math.sign(k)* -1
        //var deg = degTest * Math.sign(k)
    } else {
        //var except = undefined
        var deg = objData.deg
        //console.log(`detected different vector, deg is ${deg}, lineVec is ${lineVec}, normal is ${objData.normal}`)
    }

    return {
        'type': objData.type,
        'centerPos' : newPos,
        'normal' : newVec, //warning, divs dont have back so invert this and poof, its gone
        'deg': deg,
        'width': objData.width,
        'height': objData.height,
        'color': objData.color,
        //'except': except
    }
}

function rotateScene(sceneData, lineVec, linePoint, deg){
    var arr = document.getElementById('playerCam').children
    for(var i = 0; i < arr.length; i++){
        var data = contructObjDataFromElement(arr[i])
        var newData = rotateObject(sceneData.camNormal, data, lineVec, linePoint, deg)
        updateObject(arr[i], sceneData.camNormal, newData, newData.except)
    }
}

function lineProjectionOntoObject(lineVec, linePoint, objData){
    //find intesection of a line and a plane
    //d is the d in the formular for the plane
    //boils the intersetion formular down, its in the form m*t + n = 0
    var d = -1 * (objData.normal[0] * objData.centerPos[0] + objData.normal[1] * objData.centerPos[1] + objData.normal[2] * objData.centerPos[2])
    var n =  objData.normal[0] * linePoint[0] + objData.normal[1] * linePoint[1] + objData.normal[2] * linePoint[2] + d
    var m = objData.normal[0] * lineVec[0] + objData.normal[1] * lineVec[1] + objData.normal[2] * lineVec[2]
    
    if(m == 0) return undefined
    var t = (-1 * n) / m
    if(t == (-Infinity) || t == Infinity) return undefined

    var x0 = linePoint[0] + lineVec[0] * t
    var y0 = linePoint[1] + lineVec[1] * t
    var z0 = linePoint[2] + lineVec[2] * t

    var intersection = [x0, y0, z0]
    //check vector (intersection - linepoint) if same direction as lineVec
    //(dot product close to 1)
    //if no return undefine, if yes continue
    var check = dotProduct(minus2Vector(intersection, linePoint), lineVec)
    if (check < 0.95) return undefined
    //reverse all the rotation to get a point on the default plane
    var reverse = minus2Vector(intersection, objData.centerPos)
    var deg = degBetween2Vector([0, 0, 1], objData.normal) * -1
    var axis = crossProduct([0, 0, 1], objData.normal)
    reverse = rotateAroundLine(reverse, axis, [0, 0, 0], deg)
    var deg1 = objData.deg
    reverse = rotateAroundLine(reverse, [0, 0, 1], [0, 0, 0], deg1)
    //check to see if the intersection point is in range of the div
    //return it if yes
    //return undefine if no
    if(reverse[2] != 0) console.log(`error finding intersection: reverse projection z isnt 0, z = ${reverse[2]}`)
    var dx = Math.abs(reverse[0])
    var dy = Math.abs(reverse[1])
    if(dx <= objData.width/2 && dy <= objData.height/2){
        return intersection
    } else {
        return undefined
    }

}

//it moves opposite the lineVec by default
function forcemovePoint(distance, lineVec, point){
    var x = invert(normalize(lineVec))
    var final = [x[0] * distance + point[0], x[1] * distance + point[1], x[2] * distance + point[2]]
    return final
}

function moveScene(distance, minDistance, lineVec, linePoint, screenNormal){
    var arr = document.getElementById('playerCam').children
    var min = Infinity
    var minD = -420
    for(var i = 0; i < arr.length; i++){
        var data = contructObjDataFromElement(arr[i])
        //console.log(`deg step 1 of translate function: ${data.deg}`)
        var res = lineProjectionOntoObject(lineVec, linePoint, data)
        if(res){
            var d = Math.hypot(...minus2Vector(res, linePoint))
            if(d < min){
                min = d
                minD = d 
            }
        }
    }
    if(minD == -420) minD = Infinity
    distance = Math.min(Math.max(minD - minDistance, 0), distance)
    for(var i = 0; i < arr.length; i++){
        var data = contructObjDataFromElement(arr[i])
        var move = forcemovePoint(distance, lineVec, data.centerPos)
        data.centerPos = move
        updateObject(arr[i], screenNormal, data, ['w','h','color','axisx','axisy','axisz','deg','normalx','normaly','normalz','deg2'])
    }
}


//['w','h','x','y','z','color','axisx','axisy','axisz','deg','normalx','normaly','normalz','deg2']