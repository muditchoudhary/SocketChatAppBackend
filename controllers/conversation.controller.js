export async function addConversationMessage(req, res) {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
