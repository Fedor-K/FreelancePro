import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  EdgeTypes,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MindMapVisualizationProps {
  project: Project;
  onSave?: (nodes: any[], edges: any[]) => void;
  initialNodes?: any[];
  initialEdges?: any[];
  isEditable?: boolean;
  collaborative?: boolean;
}

// Custom node component
const CustomNode = ({ data, id }: { data: any; id: string }) => {
  return (
    <div className="custom-node px-4 py-2 rounded-md bg-white border border-gray-300 shadow-sm">
      <div className="font-medium text-sm">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}
    </div>
  );
};

// Node types definition
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function MindMapVisualization({
  project,
  onSave,
  initialNodes = [],
  initialEdges = [],
  isEditable = true,
  collaborative = false,
}: MindMapVisualizationProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.length > 0 ? initialNodes : generateDefaultNodes(project));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.length > 0 ? initialEdges : []);
  const [nodeName, setNodeName] = useState('');
  const [nodeDescription, setNodeDescription] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // If in collaborative mode, websocket connection would be initialized here
  useEffect(() => {
    if (collaborative) {
      // WebSocket setup code for collaborative editing would go here
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      try {
        const socket = new WebSocket(wsUrl);
        
        socket.addEventListener('open', () => {
          console.log('Connected to WebSocket server');
          
          // Join specific project room
          socket.send(JSON.stringify({
            type: 'join',
            projectId: project.id
          }));
        });
        
        socket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'node_update') {
              // Update nodes on receiving updates from other users
              setNodes((nds) => 
                nds.map((node) => 
                  node.id === data.node.id ? { ...node, ...data.node } : node
                )
              );
            } else if (data.type === 'edge_update') {
              // Update edges on receiving updates from other users
              setEdges((eds) => 
                eds.map((edge) => 
                  edge.id === data.edge.id ? { ...edge, ...data.edge } : edge
                )
              );
            } else if (data.type === 'node_add') {
              // Add new node from other users
              setNodes((nds) => [...nds, data.node]);
            } else if (data.type === 'edge_add') {
              // Add new edge from other users
              setEdges((eds) => [...eds, data.edge]);
            } else if (data.type === 'node_remove') {
              // Remove node based on updates from other users
              setNodes((nds) => nds.filter((n) => n.id !== data.nodeId));
            } else if (data.type === 'edge_remove') {
              // Remove edge based on updates from other users
              setEdges((eds) => eds.filter((e) => e.id !== data.edgeId));
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });
        
        socket.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: 'Connection Error',
            description: 'Failed to establish collaborative connection',
            variant: 'destructive',
          });
        });
        
        // Cleanup on component unmount
        return () => {
          socket.close();
        };
      } catch (error) {
        console.error('WebSocket setup error:', error);
      }
    }
  }, [collaborative, project.id, toast]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = { ...params, id: `e${params.source}-${params.target}` };
      setEdges((eds) => addEdge(newEdge, eds));
      
      // If collaborative, send new edge to server
      if (collaborative) {
        // WebSocket send code would go here
      }
    },
    [setEdges, collaborative]
  );

  const handleAddNode = () => {
    if (!nodeName.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a name for the node',
        variant: 'destructive',
      });
      return;
    }

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      data: { 
        label: nodeName,
        description: nodeDescription
      },
      position: { 
        x: Math.random() * 300, 
        y: Math.random() * 300 
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeName('');
    setNodeDescription('');
    
    // If collaborative, send new node to server
    if (collaborative) {
      // WebSocket send code would go here
    }
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    // Also remove any connected edges
    setEdges((eds) => eds.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    ));
    setSelectedNode(null);
    
    // If collaborative, send node deletion to server
    if (collaborative) {
      // WebSocket send code would go here
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
    
    toast({
      title: 'Mind Map Saved',
      description: 'Your mind map has been saved successfully',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Project Mind Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1">
              <Input
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="Node name"
                disabled={!isEditable}
              />
            </div>
            <div className="flex-1">
              <Input
                value={nodeDescription}
                onChange={(e) => setNodeDescription(e.target.value)}
                placeholder="Description (optional)"
                disabled={!isEditable}
              />
            </div>
            <Button 
              onClick={handleAddNode} 
              disabled={!isEditable}
              className="whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </div>
          
          {selectedNode && isEditable && (
            <div className="mb-4 flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div>
                <span className="font-medium">Selected: </span>
                <span>{selectedNode.data.label}</span>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteNode}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex-1 h-[400px] border rounded-md overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isEditable ? onNodesChange : undefined}
          onEdgesChange={isEditable ? onEdgesChange : undefined}
          onConnect={isEditable ? onConnect : undefined}
          onNodeClick={isEditable ? handleNodeClick : undefined}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      {isEditable && onSave && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Mind Map
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to generate default nodes for a project
function generateDefaultNodes(project: Project) {
  return [
    {
      id: 'project',
      type: 'custom',
      data: { 
        label: project.name,
        description: project.description || 'Project root node'
      },
      position: { x: 250, y: 50 }
    },
    {
      id: 'deliverables',
      type: 'custom',
      data: { 
        label: 'Deliverables',
        description: 'Project deliverables'
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'timeline',
      type: 'custom',
      data: { 
        label: 'Timeline',
        description: `Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}`
      },
      position: { x: 400, y: 200 }
    }
  ];
}