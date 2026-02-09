import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getSession } from "@/lib/auth";

export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement"
  | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const session = await getSession();
  const role = session?.role as string;
  const currentUserId = session?.userId as string;

  if (type !== "delete") {
    try {
      switch (table) {
        case "subject":
          const subjectTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = { teachers: subjectTeachers };
          break;
        case "class":
          const classGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
          });
          const classTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = { teachers: classTeachers, grades: classGrades };
          break;
        case "teacher":
          const teacherSubjects = await prisma.subject.findMany({
            select: { id: true, name: true },
          });
          relatedData = { subjects: teacherSubjects };
          break;
        case "student":
          const studentGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
          });
          const studentClasses = await prisma.class.findMany({
            include: { _count: { select: { students: true } } },
          });
          relatedData = { classes: studentClasses, grades: studentGrades };
          break;
        case "exam":
          const examLessons = await prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { id: true, name: true },
          });
          relatedData = { lessons: examLessons };
          break;
        case "result":
          const resultExams = await prisma.exam.findMany({
            where: {
              ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
            },
            select: { id: true, title: true },
          });
          const resultAssignments = await prisma.assignment.findMany({
            where: {
              ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
            },
            select: { id: true, title: true },
          });
          const resultStudents = await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = {
            exams: resultExams,
            assignments: resultAssignments,
            students: resultStudents,
          };
          break;
        case "attendance":
          const attendanceLessons = await prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { id: true, name: true },
          });
          const attendanceStudents = await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = {
            lessons: attendanceLessons,
            students: attendanceStudents,
          };
          break;
        case "event":
          const eventClasses = await prisma.class.findMany({
            select: { id: true, name: true },
          });
          relatedData = { classes: eventClasses };
          break;
        case "lesson":
          const [lessonSubjects, lessonClasses, lessonTeachers] = await prisma.$transaction([
            prisma.subject.findMany({ select: { id: true, name: true } }),
            prisma.class.findMany({ select: { id: true, name: true } }),
            prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
          ]);
          relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
          break;
        case "announcement":
          const announcementClasses = await prisma.class.findMany({
            select: { id: true, name: true },
          });
          relatedData = { classes: announcementClasses };
          break;
        case "message":
          const [teachers, students, parents, admins] = await prisma.$transaction([
            prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
            prisma.student.findMany({ select: { id: true, name: true, surname: true } }),
            prisma.parent.findMany({ select: { id: true, name: true, surname: true } }),
            prisma.admin.findMany({ select: { id: true, username: true } }),
          ]);
          const allUsers = [
            ...teachers.map(t => ({ id: t.id, name: `${t.name} ${t.surname} (Teacher)` })),
            ...students.map(s => ({ id: s.id, name: `${s.name} ${s.surname} (Student)` })),
            ...parents.map(p => ({ id: p.id, name: `${p.name} ${p.surname} (Parent)` })),
            ...admins.map(a => ({ id: String(a.id), name: `${a.username} (Admin)` })),
          ];
          relatedData = { users: allUsers };
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Database fetch failed in FormContainer:", err);
      // relatedData will remain empty {}, which components should handle gracefully
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
