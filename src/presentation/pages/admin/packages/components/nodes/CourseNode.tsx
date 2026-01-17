import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BookOpen } from 'lucide-react';
import { CourseNodeData } from '../../types';

const handleStyle = {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    background: '#3b82f6',
};

export const CourseNode = memo(({ data, selected }: NodeProps<any>) => {
    // Cast data safely
    const courseData = data as unknown as CourseNodeData;

    return (
        <div className={`
            min-w-[180px] rounded-xl p-3 relative
            bg-gradient-to-br from-blue-100 to-blue-50
            border-2 ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-blue-200'}
            transition-all duration-200 group
        `}>
            {/* Source handles on all sides */}
            <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                    <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 text-sm truncate" title={courseData.label}>
                        {courseData.label}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-blue-700">
                            {Number(courseData.price || 0).toLocaleString()} ر.ع
                        </span>
                        {courseData.hours && (
                            <span className="text-[10px] text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">
                                {courseData.hours}h
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
