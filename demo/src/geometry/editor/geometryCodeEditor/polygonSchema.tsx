export const polygonSchema = {
    type: "array",
    items: {
        type: "object",
        required: ["polygon"],
        properties: {
            data: {},
            polygon: {
                type: "array",
                description: "The points of the polygon",
                items: {
                    type: "object",
                    description: "A point",
                    required: ["x", "y"],
                    properties: {
                        x: {
                            type: "number",
                            description: "The x coordinate of a point",
                        },
                        y: {
                            type: "number",
                            description: "The y coordinate of a point",
                        },
                    },
                },
            },

            color: {
                type: "string",
                description: "The css color of the polygon",
            },
            edgeColor: {
                type: "string",
                description: "The css color of the edges of the polygon",
            },
            pointColor: {
                type: "string",
                description: "The css color of the points of the polygon",
            },

            opacity: {
                type: "number",
                description: "The opacity of the polygon",
                minimum: 0,
                maximum: 1,
            },
            edgeOpacity: {
                type: "number",
                description: "The opacity of the edges of the polygon",
                minimum: 0,
                maximum: 1,
            },
            pointOpacity: {
                type: "number",
                description: "The opacity of the points of the polygon",
                minimum: 0,
                maximum: 1,
            },

            edgeSize: {
                type: "number",
                description: "The width of the edges of the polygon",
                minimum: 0,
            },
            pointSize: {
                type: "number",
                description: "The size of the points of the polygon",
                minimum: 0,
            },
        },
    },
};
