
export const getDummyData = (): TodoItem[] => {
  return Array.from({ length: 10 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      todo: `あーでもない、こーでもない。いろいろなTodo (id: ${id})`,
      importance: "low",
      memo: "",
      limitDate: null,
      order: 1,
      completedAt: null,
      createdAt: 1234,
      modifiedAt: 1234,
    };
  });
};

