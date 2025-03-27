
import React, { useEffect, useRef } from 'react';
import { Trash, Copy, Edit, Link, Unlink } from 'lucide-react';

interface NodeContextMenuProps {
  nodeId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
}

export function NodeContextMenu({
  nodeId,
  position,
  onClose,
  onDelete,
  onEdit,
  onDuplicate,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle delete action
  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };
  
  // Handle edit action
  const handleEdit = () => {
    onEdit(nodeId);
    onClose();
  };
  
  // Handle duplicate action
  const handleDuplicate = () => {
    onDuplicate(nodeId);
    onClose();
  };
  
  return (
    <div
      ref={menuRef}
      className="node-context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        className="node-context-menu-item"
        onClick={handleEdit}
      >
        <Edit size={16} />
        Edit
      </button>
      <button
        className="node-context-menu-item"
        onClick={handleDuplicate}
      >
        <Copy size={16} />
        Duplicate
      </button>
      <button
        className="node-context-menu-item"
        onClick={handleDelete}
      >
        <Trash size={16} />
        Delete
      </button>
    </div>
  );
}

export default NodeContextMenu;
