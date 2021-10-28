import React, { Component } from 'react'

import './LocationVisualizer.css';
import Node from './Node/Node';
import {dijkstra} from '../algorithms/dijkstra';
import _ from "lodash";


export default class LocationVisualizer extends Component {

    constructor(props) {
        super(props)
        this.distanceGrid = [];
        this.maxDistance = 0;
        this.state = {
            grid:[],
            mouseIsPressed: false,
            startingNodes: [],
            selectStartingNode: false,
        }
    }

    startingNodeButtonMouseDown() {
        this.setState({selectStartingNode: true});
    }

    componentDidMount() {
        const grid = getInitialGrid();
        this.setState({grid});
    }

    handleMouseDown(row, col) {
        if (this.state.selectStartingNode) {
            const newGrid = getNewGridWIthNewStartingNode(this.state.grid, row, col);
            this.setState({grid: newGrid, selectStartingNode: false, startingNodes: [...this.state.startingNodes, newGrid[row][col]]});
        } else {
            const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
            this.setState({grid: newGrid, mouseIsPressed: true});
        }
    }
    
    handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
    }

    handleMouseUp() {
    this.setState({mouseIsPressed: false});
    }

    animateDijkstra(visitedNodesInOrder) {
        const maximum_distance = this.maxDistance;
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            const node = visitedNodesInOrder[i];
            if (!node.isNearWall) {
                continue;
            }
            const distance_percent = node.distance/maximum_distance;
            let r = Math.round(255 * distance_percent);
            let b = Math.round(255 * (1 - distance_percent));
            if (r > 255) {
                r = 255;
                b = 0;
            }
            const node_color = rgbToHex(r, b, 0);
            document.getElementById(`node-${node.row}-${node.col}`).style.backgroundColor =
                node_color;
        }
    }

    getFinalData() {
        const distanceGrid = this.distanceGrid;
        const visitedNodes = [];

        for(let i=0; i < distanceGrid.length; i++) {
            for(let j=0; j<distanceGrid[0].length; j++) {
                if(distanceGrid[i][j].isNearWall) {
                    visitedNodes.push(distanceGrid[i][j]);
                    if (this.maxDistance < distanceGrid[i][j].distance) {
                        this.maxDistance = distanceGrid[i][j].distance;
                    }
                }
            }
        }

        return visitedNodes;
    }

    updaterGridWithDistance(visitedNodesInOrder) {
        const {grid, maxDistance} = this.state;
        const distanceGrid = this.distanceGrid;
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            const node = visitedNodesInOrder[i];
            if (node.isNearWall && distanceGrid[node.row][node.col].distance > node.distance) {
                distanceGrid[node.row][node.col].distance = node.distance;
                distanceGrid[node.row][node.col].isNearWall = true;
            } 
        }
    }

    visualizeDijkstra() {
        const {grid, startingNodes} = this.state;
        this.distanceGrid = _.clone(grid)
        for (let i = 0; i < startingNodes.length; i++) {
            const newGrid = _.cloneDeep(grid);
            const startNode = startingNodes[i];
            if (i != 0) {
                const prevStartNode = startingNodes[i-1];
                newGrid[prevStartNode.row][prevStartNode.col].distance = 600;
            }
            // const startNode = grid[startNode.row][startNode.col];
            const visitedNodesInOrder = dijkstra(newGrid, startNode);
            this.updaterGridWithDistance(visitedNodesInOrder);
        }
        // const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        const visitedNodesInOrder = this.getFinalData();
        this.animateDijkstra(visitedNodesInOrder);
        
    }
    

    render() {

        const {grid, mouseIsPressed} = this.state;

        return (
            <>
                <button onClick={() => this.startingNodeButtonMouseDown()}>
                    Select Start/End Nodes
                </button>
                <button onClick={() => this.visualizeDijkstra()}>
                    Visualize Convenient Locations
                </button>
                <div className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                        <div key={rowIdx}>
                            {row.map((node, nodeIdx) => {
                            const {row, col, isFinish, isStart, isWall} = node;
                            return (
                                <Node
                                key={nodeIdx}
                                col={col}
                                isFinish={isFinish}
                                isStart={isStart}
                                isWall={isWall}
                                mouseIsPressed={mouseIsPressed}
                                onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                                onMouseEnter={(row, col) =>
                                    this.handleMouseEnter(row, col)
                                }
                                onMouseUp={() => this.handleMouseUp()}
                                row={row}></Node>
                            );
                            })}
                        </div>
                        );
                    })}
                    </div>
            </>
        )
    }

    
}

const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
};

const createNode = (col, row) => {
    return {
      col,
      row,
      isStart: false,
      isFinish: false,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
      isNearWall: false,
    };
};

const getNewGridWithWallToggled = (grid, row, col) => {
const newGrid = grid.slice();
const node = newGrid[row][col];
const newNode = {
    ...node,
    isWall: !node.isWall,
};
newGrid[row][col] = newNode;
return newGrid;
};

const getNewGridWIthNewStartingNode = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
        ...node,
        isStart: true,
    };
    newGrid[row][col] = newNode;
    return newGrid;
}

function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}