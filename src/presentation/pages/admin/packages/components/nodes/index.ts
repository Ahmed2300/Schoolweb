import { NodeTypes } from '@xyflow/react';
import { PackageNode } from './PackageNode';
import { CourseNode } from './CourseNode';
import { TermNode } from './TermNode';
import { GradeNode } from './GradeNode';

export const nodeTypes: NodeTypes = {
    packageNode: PackageNode as any,
    courseNode: CourseNode as any,
    termNode: TermNode as any,
    gradeNode: GradeNode as any,
};
