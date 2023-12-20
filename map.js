//find largest rectangle in a matrix (downward propagation method)
//step1: find the 1st row that has the largest numer of 1
//step2: propagate downward
//i could have probagate rightward instead but eh, lazy
function findLargestRectangle(matrix){
    var final = []
    
    var maxL = -Infinity
    var maxR = 0
    var pos = []
    matrix.forEach((i, index) => {   
        var k = i.join('').split('0').sort((a, b) => b.length - a.length)[0]
        
        var start = i.join('').indexOf(k)
        var num1 = k.length
        var end = start + num1 - 1
        
        var m = []
        for(var x = start; x <= end; x++){
            m.push([index, x])
        }
        
        if(num1 > maxL) {
            maxL = num1,
            maxR = index
            pos = [start, end]
            final = m
        }
    })
    
    for(var i = maxR + 1; i < matrix.length; i++){
        var m = []
        for(var x = pos[0]; x <= pos[1]; x++){
            if(matrix[i][x] == 1){
                m.push([i, x])
            }            
        }
        
        if (m.length == maxL){
            final = final.concat(m)
        } else {
            break
        }
    }
    
    //return final for the largest rectangle found
    //return [final[0]] for exactly 1 square in said rectangle
    //return final
    return (final.length) ? [final[0]] : [] 
    
}

function analizeWalls(x){
    var matrix = x
    var final = []

    var n = 0
    while(n < 10000){
        var k = findLargestRectangle(matrix)
        final.push(k)
        k.forEach(i=> {
            matrix[i[0]][i[1]] = 0
        })
        if(JSON.stringify(matrix, null, 0).indexOf('1') < 0) return final;
    }
    return final
}

function ananizeWallMap(map, squareW, squareH, ceilingH, playerPos, color){   
    //i tried my best to explain the codes in the comments below but
    //if in the future, you ever need to modify this piece of confusion due to a bug, pls just rewrite it entirely
    //its not anything hard, just data manip

    //we conbine all left walls of 1 collumn into datum, then push it onto data in the next collumn over
    //repeat for the other types of walls
    var final = {}
    var keys = ['left', 'right', 'front', 'back', 'ceiling', 'floor']
    var res = {}

    keys.forEach((key, keyindex) => {
        map.forEach((i, mapIndex) => {
            i.forEach((n, nindex) => {
                n.forEach((m, mindex) => {
                    //console.log(`row ${nindex} collumn ${mindex} is ${m}`)
                    if(!res[key]) res[key] = []

                    if(keyindex == 0 || keyindex == 1) {
                        if(!res[key][mapIndex]) res[key].push([])
                        if(mindex < res[key][mapIndex].length){
                            res[key][mapIndex][mindex].push(Number(m[keyindex]))
                        } else {
                            res[key][mapIndex].push([Number(m[keyindex])])
                        }
                    } else {
                        if(!res[key][mapIndex]) res[key].push([])
                        if(nindex < res[key][mapIndex].length){
                            res[key][mapIndex][nindex].push(Number(m[keyindex]))
                        } else {
                            res[key][mapIndex].push([Number(m[keyindex])])
                        }
                    }

                })
            })
        })
    })
    
    //data correction part
    //do not fix the 1st part since fixxing it would make it not generic for all directions
    //after the correction, each index is the 2d matrix of the corresposding wall, the index is how far it is from the left most wall
    keys.forEach((key, keyindex) => {
        var res2 = []
        res[key][0].forEach((i, index) => {
            var temp = []
            res[key].forEach(n => {
                temp.push(n[index])
            })
            temp.reverse()
            res2.push(temp)
        })
        final[key] = res2
    })
    final['floor'] = res['floor']
    final['ceiling'] = res['ceiling']

    var finalForReal = []
    keys.forEach(i => {
        final[i].forEach((n, index) => {
            var temp = analizeWalls(n)
            temp.forEach(wall => {
                if(wall && wall.length){
                    try{
                        var res3 = wallDataToObj(wall, index, i, squareW, squareH, ceilingH, playerPos, color)
                        finalForReal.push(res3)
                    }catch(err){
                        //do nothing
                    }                    
                }
            })
        })
    })

    return finalForReal
}

function wallDataToObj(wall, wallLayer, wallType, squareW, squareH, ceilingH, playerPos, color){
    //squareH dictate the unit of the z direction
    //squareW dictate the unit of the x direction
    //ceilingH dictate the unit of the y direction
    if(wallType == 'left' || wallType == 'right'){
        //wall indexes [x, y] is [-z, -y] in real coors
        //wallLayer is x in real coors, no flipping
        var topLeftIndex = wall[0]
        var bottomRightIndex = wall[wall.length - 1]
        //console.log(topLeftIndex[1] - bottomRightIndex[1])

        var wallWidth = (Math.abs(topLeftIndex[1] - bottomRightIndex[1]) + 1)  * squareH
        var wallHeight = (Math.abs(topLeftIndex[0] - bottomRightIndex[0]) + 1) * ceilingH

        //console.log(wall)
        //converted
        var centerPos = [(wallLayer - playerPos[1]) * squareW, ((topLeftIndex[0] + bottomRightIndex[0])/2 - playerPos[2]) * -1 * ceilingH, ((topLeftIndex[1] + bottomRightIndex[1])/2 - playerPos[0]) * squareH]
        
        if(wallType == 'left'){
            centerPos[0] = centerPos[0] - squareW/2
            var normal = [1, 0, 0]
            var cindex = 0
        } else {
            centerPos[0] = centerPos[0] + squareW/2
            var normal = [-1, 0, 0]
            var cindex = 1
        }

        return {
            'type': ["wall", wallType],
            'centerPos' : centerPos,
            'normal' : normal, 
            'deg': 0, 
            'width': wallWidth,
            'height': wallHeight,
            'color': color[cindex]
        }
    }
    if(wallType == 'front' || wallType == 'back'){
        //wall indexes [x, y] is [x, -y] in real coors
        //wallLayer is -z in real coors
        var topLeftIndex = wall[0]
        var bottomRightIndex = wall[wall.length - 1]

        var wallWidth = (Math.abs(topLeftIndex[1] - bottomRightIndex[1]) + 1) * squareW
        var wallHeight = (Math.abs(topLeftIndex[0] - bottomRightIndex[0]) + 1) * ceilingH

        //console.log((topLeftIndex[0] + bottomRightIndex[0])/2)
        //converted
        var centerPos = [((topLeftIndex[1] + bottomRightIndex[1])/2 - playerPos[1]) * squareW, ((topLeftIndex[0] + bottomRightIndex[0])/2 - playerPos[2]) * -1 * ceilingH, (wallLayer - playerPos[0]) * squareH]
        //var centerPos = [(wallLayer - playerPos[1]) * squareW, ((topLeftIndex[1] + bottomRightIndex[1])/2 - playerPos[2]) * -1 * ceilingH, ((topLeftIndex[0] + bottomRightIndex[0])/2 - playerPos[0]) * -1 * squareH]
        
        if(wallType == 'front'){
            centerPos[2] = centerPos[2] - squareH/2
            var normal = [0, 0, 1]
            var cindex = 2
        } else {
            centerPos[2] = centerPos[2] + squareH/2
            var normal = [0, 0, -1]
            var cindex = 3
        }

        return {
            'type': ["wall", wallType],
            'centerPos' : centerPos,
            'normal' : normal, 
            'deg': 0, 
            'width': wallWidth,
            'height': wallHeight,
            'color': color[cindex]
        }
    }
    if(wallType == 'ceiling' || wallType == 'floor'){
        //wall indexes [x, y] is [x, z] in real coors
        //wallLayer is -y in real coors
        var topLeftIndex = wall[0]
        var bottomRightIndex = wall[wall.length - 1]

        var wallWidth = (Math.abs(topLeftIndex[1] - bottomRightIndex[1]) + 1) * squareW
        var wallHeight = (Math.abs(topLeftIndex[0] - bottomRightIndex[0]) + 1) * squareH

        //console.log((topLeftIndex[0] + bottomRightIndex[0])/2)
        //converted
        var centerPos = [((topLeftIndex[1] + bottomRightIndex[1])/2 - playerPos[1]) * squareW, (wallLayer - playerPos[2]) * -1 * ceilingH, ((topLeftIndex[0] + bottomRightIndex[0])/2 - playerPos[0]) * squareH]
        //var centerPos = [(wallLayer - playerPos[1]) * squareW, ((topLeftIndex[1] + bottomRightIndex[1])/2 - playerPos[2]) * -1 * ceilingH, ((topLeftIndex[0] + bottomRightIndex[0])/2 - playerPos[0]) * -1 * squareH]
        
        if(wallType == 'ceiling'){
            centerPos[1] = centerPos[1] - ceilingH/2
            var normal = [0, 1, 0]
            var cindex = 4
        } else {
            centerPos[1] = centerPos[1] + ceilingH/2
            var normal = [0, -1, 0]
            var cindex = 5
        }

        return {
            'type': ["wall", wallType],
            'centerPos' : centerPos,
            'normal' : normal, 
            'deg': 0, 
            'width': wallWidth,
            'height': wallHeight,
            'color': color[cindex]
        }
    }

}

function mapToWallData(map){
    var wallDatum = []

    map.forEach((layer, layerindex) => {
        wallDatum.push([])
        layer.forEach((row, rowindex) => {

            var rowDatum = []
            row.forEach((square, squareindex) => {
                rowDatum.push([0, 0, 0, 0, 0, 0])
                if(square == 0) {
                    //rowDatum[squareindex] = [0, 0, 0, 0, 0, 0]
                    //the line above basically do nothing
                } else {
                    //left
                    if(!map[layerindex][rowindex][squareindex - 1] || map[layerindex][rowindex][squareindex - 1] == 0){
                        rowDatum[squareindex][0] = 1
                    }
                    //right
                    if(!map[layerindex][rowindex][squareindex + 1] || map[layerindex][rowindex][squareindex + 1] == 0){
                        rowDatum[squareindex][1] = 1
                    }
                    //front
                    if(!map[layerindex][rowindex - 1] || map[layerindex][rowindex - 1][squareindex] == 0){
                        rowDatum[squareindex][2] = 1
                    }
                    //back
                    if(!map[layerindex][rowindex + 1] || map[layerindex][rowindex + 1][squareindex] == 0){
                        rowDatum[squareindex][3] = 1
                    }
                    //ceiling
                    // if(!map[layerindex + 1] || map[layerindex + 1][rowindex][squareindex] == 0){
                    //     rowDatum[squareindex][4] = 1
                    // }
                    //floor
                    if(!map[layerindex - 1] || map[layerindex - 1][rowindex][squareindex] == 0){
                        rowDatum[squareindex][5] = 1
                    }
                }

                
                rowDatum[squareindex] = rowDatum[squareindex].join("")
                //console.log(`rowDatum after: ${rowDatum[squareindex]}`)
            })
            
            wallDatum[layerindex].push(rowDatum)
        })
    })

    return wallDatum
}

function analizeMap(map, squareW, squareH, ceilingH, playerPos, color){
    var k = mapToWallData(map)
    var final = ananizeWallMap(k, squareW, squareH, ceilingH, playerPos, color)
    return final
}

//code for walls is binary, the order is
//left wall, right wall, front wall, back wall, ceiling, floor
var wallmap0 = [[
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '110111', '000000', '000000'],
]
]

//example of a wall map
var wallmap2 = [[
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '101001', '000001', '011001', '000000'],
    ['000000', '100101', '000101', '010101', '000000'],
], [
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '000000', '000000', '000000', '000000'],
    ['000000', '101010', '000010', '011010', '000000'],
    ['000000', '100110', '000110', '010110', '000000'],
]
]

var playerPos1 = [4, 2, 0] //[the row, the collumn, the layer]
//note for map making, layer0 = ground floor by default, deal with it
var map = [[
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
]
]

//left wall, right wall, front wall, back wall, ceiling, floor
var wallcolor = [[66, 135, 245], [66, 135, 245], [66, 245, 188], [66, 245, 188], [0, 0, 0], [197, 66, 260]]
//disabled ceiling due to uhhh dumness, enable it back at line 285