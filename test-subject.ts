
import { PrismaClient } from '@prisma/client';

async function testSubject() {
    const prisma = new PrismaClient();
    try {
        // 1. Create a subject
        console.log('Creating test subject...');
        const subject = await prisma.subject.create({
            data: { name: 'Test Subject ' + Date.now() }
        });
        console.log('Subject created:', subject.name);

        // 2. Create a lesson for this subject
        console.log('Creating lesson for subject...');
        // Need a teacher and a class. Let's find existing ones.
        const teacher = await prisma.teacher.findFirst();
        const classItem = await prisma.class.findFirst();

        if (!teacher || !classItem) {
            console.log('Need at least one teacher and one class to test lesson creation.');
            return;
        }

        const lesson = await prisma.lesson.create({
            data: {
                name: 'Test Lesson',
                day: 'MONDAY',
                startTime: new Date(),
                endTime: new Date(),
                subjectId: subject.id,
                classId: classItem.id,
                teacherId: teacher.id
            }
        });
        console.log('Lesson created linked to subject.');

        // 3. Delete subject and verify lesson is gone (Cascade)
        console.log('Deleting subject (Testing Cascade)...');
        await prisma.subject.delete({ where: { id: subject.id } });

        const lessonCheck = await prisma.lesson.findUnique({ where: { id: lesson.id } });
        if (!lessonCheck) {
            console.log('Success! Lesson was automatically deleted (Cascade worked).');
        } else {
            console.log('Failed! Lesson still exists.');
        }

    } catch (error: any) {
        console.error('Test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testSubject();
