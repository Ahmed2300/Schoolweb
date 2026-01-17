import { NodeTypes } from '@xyflow/react';
import { PackageNode } from './PackageNode';
import { CourseNode } from './CourseNode';
import { TermNode } from './TermNode';
import { GradeNode } from './GradeNode';

export const nodeTypes: NodeTypes = {
    packageNode: PackageNode,
    courseNode: CourseNode,
    termNode: TermNode,
    gradeNode: GradeNode,
};
