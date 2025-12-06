routerAdd("*", (c) => {
  c.response().header().set("Access-Control-Allow-Origin", "*");
  c.response().header().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.response().header().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.request().method == "OPTIONS") {
    return c.noContent(204);
  }

  return c.next();
});
