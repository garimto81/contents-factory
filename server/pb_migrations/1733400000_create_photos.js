/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    id: "photos",
    name: "photos",
    type: "base",
    system: false,
    schema: [
      {
        name: "title",
        type: "text",
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: "image",
        type: "file",
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"]
        }
      },
      {
        name: "thumbnail",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 1048576,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"]
        }
      },
      {
        name: "device_id",
        type: "text",
        required: false,
        options: { max: 50 }
      }
    ],
    indexes: [],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: ""
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("photos");
  return dao.deleteCollection(collection);
});
