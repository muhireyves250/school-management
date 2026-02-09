"use server";

import { revalidatePath } from "next/cache";
import {
  AssignmentSchema,
  AttendanceSchema,
  AnnouncementSchema,
  ClassSchema,
  ExamSchema,
  EventSchema,
  LessonSchema,
  MessageSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  SettingsSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { hashPassword, comparePassword, getSession } from "./auth";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSession();
    if (session?.role !== "admin") return { success: false, error: true };

    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    const hashedPassword = await hashPassword(data.password || "password123");

    await prisma.teacher.create({
      data: {
        id: data.username,
        username: data.username,
        password: hashedPassword,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      } as any,
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(hashedPassword && { password: hashedPassword }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      } as any,
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const hashedPassword = await hashPassword(data.password || "password123");

    await prisma.student.create({
      data: {
        id: data.username,
        username: data.username,
        password: hashedPassword,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      } as any,
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(hashedPassword && { password: hashedPassword }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      } as any,
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSession();
    if (session?.role !== "admin") return { success: false, error: true };

    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    const hashedPassword = await hashPassword(data.password || "password123");

    await prisma.parent.create({
      data: {
        id: data.username,
        username: data.username,
        password: hashedPassword,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      } as any,
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        ...(hashedPassword && { password: hashedPassword }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      } as any,
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSession();
    if (session?.role !== "admin") return { success: false, error: true };

    await prisma.parent.delete({
      where: { id: id },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }

    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (session?.role !== "admin" && session?.role !== "teacher") {
      return { success: false, error: true };
    }
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const session = await getSession();
    if (session?.role !== "admin") {
      return { success: false, error: true };
    }

    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: true };
    }

    await (prisma as any).message.create({
      data: {
        title: data.title,
        body: data.body,
        senderId: session.userId,
        receiverId: data.receiverId,
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: true };
    }

    // Check if the user is the sender or admin
    const message = await (prisma as any).message.findUnique({
      where: { id: parseInt(id) },
    });

    if (session.role !== "admin" && message?.senderId !== session.userId) {
      return { success: false, error: true };
    }

    await (prisma as any).message.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const updateSettings = async (
  currentState: CurrentState,
  data: SettingsSchema
) => {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: true };
    }

    const { userId, role } = session;
    const { currentPassword, newPassword, phone, email, address, img } = data;

    let user: any = null;
    let tableName: "admin" | "teacher" | "student" | "parent" = role as any;

    if (tableName === "admin") {
      user = await prisma.admin.findUnique({ where: { id: Number(userId) as any } });
    } else if (tableName === "teacher") {
      user = await prisma.teacher.findUnique({ where: { id: userId as string } });
    } else if (tableName === "student") {
      user = await prisma.student.findUnique({ where: { id: userId as string } });
    } else if (tableName === "parent") {
      user = await prisma.parent.findUnique({ where: { id: userId as string } });
    }

    if (!user) {
      return { success: false, error: true };
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: true, message: "Invalid current password" };
    }

    const updateData: any = {};
    if (newPassword) {
      updateData.password = await hashPassword(newPassword);
    }
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (img !== undefined) updateData.img = img;

    if (tableName === "admin") {
      await prisma.admin.update({ where: { id: Number(userId) as any }, data: updateData });
    } else if (tableName === "teacher") {
      await prisma.teacher.update({ where: { id: userId as string }, data: updateData });
    } else if (tableName === "student") {
      await prisma.student.update({ where: { id: userId as string }, data: updateData });
    } else if (tableName === "parent") {
      await prisma.parent.update({ where: { id: userId as string }, data: updateData });
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
