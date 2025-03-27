
import { Edge, Node, Connection, XYPosition, addEdge, Edge as FlowEdge, MarkerType } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

// Define SIPOC node types
export type SipocNodeType = 'supplier' | 'input' | 'process' | 'output' | 'customer';

// Define NodeData interface correctly
export interface NodeData {
  label: string;
  onLabelChange?: (label: string) => void;
  nodeType?: SipocNodeType; // Add node type for SIPOC
  [key: string]: any; // Index signature for compatibility
}

// Define Node and Edge types using React Flow's types
export type CustomNode = Node<NodeData>;
export type CustomEdge = Edge;

export const createNode = (position: XYPosition, type: string = 'textUpdater'): CustomNode => {
  return {
    id: `node_${uuidv4()}`,
    type,
    position,
    data: { label: 'New Node' },
  };
};

export const createEdge = (params: Connection): CustomEdge => {
  return {
    ...params,
    id: `edge_${uuidv4()}`,
    type: 'smoothstep',
    animated: false,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
  };
};

export const addNewEdge = (
  params: Connection,
  edges: CustomEdge[]
): CustomEdge[] => {
  if (!params.source || !params.target) return edges;
  
  // Create the new edge with our customizations
  const newEdge = createEdge(params);
  
  // Add the new edge to our existing edges
  return addEdge(newEdge, edges);
};

export const getNodeById = (nodes: CustomNode[], id: string): CustomNode | undefined => {
  return nodes.find(node => node.id === id);
};

export const updateNodeData = (
  nodes: CustomNode[],
  nodeId: string,
  newData: Partial<NodeData>
): CustomNode[] => {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          ...newData,
        },
      };
    }
    return node;
  });
};

export const deleteElements = (
  nodes: CustomNode[],
  edges: CustomEdge[],
  nodesToDelete: string[],
  edgesToDelete: string[]
): { nodes: CustomNode[]; edges: CustomEdge[] } => {
  // Remove the specified nodes
  const updatedNodes = nodes.filter(node => !nodesToDelete.includes(node.id));
  
  // Remove the specified edges and any edges connected to deleted nodes
  const updatedEdges = edges.filter(edge => {
    const isEdgeToDelete = edgesToDelete.includes(edge.id);
    const isConnectedToDeletedNode = 
      nodesToDelete.includes(edge.source) || nodesToDelete.includes(edge.target);
    
    return !isEdgeToDelete && !isConnectedToDeletedNode;
  });
  
  return { nodes: updatedNodes, edges: updatedEdges };
};

// Function to download diagram as JSON
export const downloadDiagramAsJson = (nodes: CustomNode[], edges: CustomEdge[]) => {
  const diagramData = { nodes, edges };
  const dataStr = JSON.stringify(diagramData, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportName = `diagram_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportName);
  linkElement.click();
};

// Function to export diagram as image
export const exportDiagramAsImage = async (reactFlowInstance: any) => {
  if (!reactFlowInstance) return;
  
  try {
    const dataUrl = await reactFlowInstance.toImage({
      quality: 1.0,
      width: reactFlowInstance.getWidth(),
      height: reactFlowInstance.getHeight(),
      backgroundColor: '#ffffff',
    });
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUrl);
    linkElement.setAttribute('download', `diagram_${new Date().toISOString().slice(0, 10)}.png`);
    linkElement.click();
  } catch (error) {
    console.error('Error exporting diagram as image:', error);
  }
};

// Function to load nodes and edges from JSON
export const loadDiagramFromJson = (jsonData: string): { nodes: CustomNode[], edges: CustomEdge[] } => {
  try {
    const parsedData = JSON.parse(jsonData);
    
    if (!parsedData.nodes || !parsedData.edges) {
      throw new Error('Invalid diagram data');
    }
    
    return {
      nodes: parsedData.nodes,
      edges: parsedData.edges,
    };
  } catch (error) {
    console.error('Error loading diagram from JSON:', error);
    return { nodes: [], edges: [] };
  }
};
