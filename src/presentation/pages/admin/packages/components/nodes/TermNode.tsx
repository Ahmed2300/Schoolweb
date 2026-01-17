import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Calendar, Loader2 } from 'lucide-react';
import { TermNodeData } from '../../types';

const handleStyle = {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    background: '#22c55e',
};

export const TermNode = memo(({ data, selected }: NodeProps<any>) => {
    const termData = data as unknown as TermNodeData;

    return (
        <div className={`
            min-w-[180px] rounded-xl p-3 relative
            bg-gradient-to-br from-green-100 to-green-50
            border-2 ${selected ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-green-200'}
            transition-all duration-200 group
        `}>
            {/* Source handles on all sides */}
            <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
            <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-sm group-hover:bg-green-600 transition-colors">
                    <Calendar size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-900 text-sm truncate" title={termData.label}>
                        {termData.label}
                    </h4>
                    {termData.isFetched ? (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-green-700">
                                {Number(termData.calculatedPrice || 0).toLocaleString()} ر.ع
                            </span>
                            <span className="text-[10px] text-green-500 bg-green-100 px-1.5 py-0.5 rounded">
                                {termData.calculatedCount || 0} كورس
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-green-600 font-medium px-1.5 py-0.5 bg-green-100 rounded">
                                Semester
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading indicator when not yet calculated */}
            {!termData.isFetched && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Loader2 size={10} className="text-white animate-spin" />
                </div>
            )}
        </div>
    );
});
