import React from "react";
import { Trash } from "lucide-react";

interface RemoveButtonProps {
  onRemove: () => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ onRemove }) => {
  return (
    <div className="ml-auto relative flex items-center">
      <div
        onClick={onRemove}
        className="absolute right-0 cursor-pointer p-2 hover:bg-gray-100 rounded-full"
      >
        <Trash size={20} />
      </div>
    </div>
  );
};

export default RemoveButton;
