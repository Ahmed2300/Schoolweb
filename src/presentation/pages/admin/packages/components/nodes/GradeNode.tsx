import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { GradeNodeData } from '../../types';

const handleStyle = {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    background: '#a855f7',
};

export const GradeNode = memo(({ data, selected }: NodeProps<any>) => {
    const gradeData = data as unknown as GradeNodeData;

    return (
        <div className={`
            min-w-[180px] rounded-xl p-3 relative
            bg-gradient-to-br from-purple-100 to-purple-50
            border-2 ${selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-purple-200'}
            transition-all duration-200 group
        `}>
            {/* Source handles on all sides */}
            <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm group-hover:bg-purple-600 transition-colors">
                    <GraduationCap size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-purple-900 text-sm truncate" title={gradeData.label}>
                        {gradeData.label}
                    </h4>
                    {gradeData.isFetched ? (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-purple-700">
                                {Number(gradeData.calculatedPrice || 0).toLocaleString()} ر.ع
                            </span>
                            <span className="text-[10px] text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded">
                                {gradeData.calculatedCount || 0} كورس
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-purple-600 font-medium px-1.5 py-0.5 bg-purple-100 rounded">
                                Grade Level
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading indicator when not yet calculated */}
            {!gradeData.isFetched && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Loader2 size={10} className="text-white animate-spin" />
                </div>
            )}
        </div>
    );
});
