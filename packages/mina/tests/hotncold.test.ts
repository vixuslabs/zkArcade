import {
  Box,
  Object3D,
  Plane,
  Room,
} from "../src/structs";
import { Vector3, Real64 } from 'zk3d';
import { ValidateRoom, RoomAndObjectCommitment } from "../src/zkprogram";

describe('Basic Functionality', () => {

  describe('Plane Validation', () => {
    it('should validate that the object is on the inner side of the plane', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.5),
        y: Real64.from(0.5),
        z: Real64.from(0.5),
      }), Real64.from(0.02));

      const plane = Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      }));
      expect(() => {
        plane.assertObjectIsOnInnerSide(object);
      }).not.toThrowError();
    });

    it('should throw an error if the object is not on the inner side of the plane', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.5),
        y: Real64.from(0.5),
        z: Real64.from(-0.5),
      }), Real64.from(0.02));

      const plane = Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      }));
      expect(() => {
        plane.assertObjectIsOnInnerSide(object);
      }).toThrowError('Object must be on the inner side of the plane');
    });

    it('should throw an error if the object is partially on the inner side of the plane', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.5),
        y: Real64.from(0.5),
        z: Real64.from(0),
      }), Real64.from(0.02));

      const plane = Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      }));
      expect(() => {
        // console.log(plane);
        plane.assertObjectIsOnInnerSide(object);
      }).toThrowError('Object must be on the inner side of the plane');
    });
  });

  describe('Box Validation', () => {
    it('should validate that the object is outside the box', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.2),
        y: Real64.from(0.2),
        z: Real64.from(0.2),
      }), Real64.from(0.02));

      const box = new Box({
        minX: Real64.from(0),
        maxX: Real64.from(0.1),
        minY: Real64.from(0),
        maxY: Real64.from(0.1),
        minZ: Real64.from(0),
        maxZ: Real64.from(0.1),
      });

      expect(() => {
        box.assertObjectIsOutside(object);
      }).not.toThrowError();
    });

    it('should throw an error if the object is inside the box', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.05),
        y: Real64.from(0.05),
        z: Real64.from(0.05),
      }), Real64.from(0.02));

      const box = new Box({
        minX: Real64.from(0),
        maxX: Real64.from(0.1),
        minY: Real64.from(0),
        maxY: Real64.from(0.1),
        minZ: Real64.from(0),
        maxZ: Real64.from(0.1),
      });

      expect(() => {
        box.assertObjectIsOutside(object);
      }).toThrowError('Object must be outside the box');
    });

    it('should throw an error if the object is partially inside the box', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.1),
        y: Real64.from(0.1),
        z: Real64.from(0.1),
      }), Real64.from(0.02));

      const box = new Box({
        minX: Real64.from(0),
        maxX: Real64.from(0.1),
        minY: Real64.from(0),
        maxY: Real64.from(0.1),
        minZ: Real64.from(0),
        maxZ: Real64.from(0.1),
      });

      expect(() => {
        box.assertObjectIsOutside(object);
      }).toThrowError('Object must be outside the box');
    });
  });

  describe('Room Validation', () => {
    let planes: Plane[];
    let boxes: Box[];
    let room: Room;

    beforeAll(() => {
      planes = [
        Plane.fromPoints(new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(1),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(0),
          z: Real64.from(0),
        })),
        Plane.fromPoints(new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(0),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(1),
        })),
        Plane.fromPoints(new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(1),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(1),
          z: Real64.from(0),
        })),
        Plane.fromPoints(new Vector3({
          x: Real64.from(1),
          y: Real64.from(0),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(1),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(0),
          z: Real64.from(1),
        })),
        Plane.fromPoints(new Vector3({
          x: Real64.from(0),
          y: Real64.from(1),
          z: Real64.from(0),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(1),
          z: Real64.from(1),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(1),
          z: Real64.from(0),
        })),
        Plane.fromPoints(new Vector3({
          x: Real64.from(0),
          y: Real64.from(0),
          z: Real64.from(1),
        }), new Vector3({
          x: Real64.from(1),
          y: Real64.from(0),
          z: Real64.from(1),
        }), new Vector3({
          x: Real64.from(0),
          y: Real64.from(1),
          z: Real64.from(1),
        })),
      ];
      boxes = [
        new Box({
          minX: Real64.from(0),
          maxX: Real64.from(0.1),
          minY: Real64.from(0),
          maxY: Real64.from(0.1),
          minZ: Real64.from(0),
          maxZ: Real64.from(0.1),
        }),
        new Box({
          minX: Real64.from(0.9),
          maxX: Real64.from(1),
          minY: Real64.from(0.9),
          maxY: Real64.from(1),
          minZ: Real64.from(0.9),
          maxZ: Real64.from(1),
        }),
      ];
      room = new Room({
        planes: planes,
        boxes: boxes,
      });
    });

    it('should validate that the object is inside a cubic room and does not collide with two pieces of furniture.', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.5),
        y: Real64.from(0.5),
        z: Real64.from(0.5),
      }), Real64.from(0.02));

      expect(() => {
        room.assertObjectIsInside(object);
      }).not.toThrowError();
    });

    it('should throw an error if the object is outside the room', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.5),
        y: Real64.from(0.5),
        z: Real64.from(-0.5),
      }), Real64.from(0.02));

      expect(() => {
        room.assertObjectIsInside(object);
      }).toThrowError('Object must be on the inner side of the plane');
    });

    it('should throw an error if the object collides with the first piece of furniture', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.05),
        y: Real64.from(0.05),
        z: Real64.from(0.05),
      }), Real64.from(0.02));

      expect(() => {
        room.assertNoCollisions(object);
      }).toThrowError('Object must be outside the box');
    });

    it('should throw an error if the object collides with the second piece of furniture', () => {
      const object = Object3D.fromPointAndRadius(new Vector3({
        x: Real64.from(0.95),
        y: Real64.from(0.95),
        z: Real64.from(0.95),
      }), Real64.from(0.02));

      expect(() => {
        room.assertNoCollisions(object);
      }).toThrowError('Object must be outside the box');
    });

  });


});

describe('ZkProgram', () => {
  let planes: Plane[];
  let boxes: Box[];
  let room: Room;

  beforeAll(() => {
    planes = [
      Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      })),
      Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(1),
      })),
      Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(1),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      })),
      Plane.fromPoints(new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(1),
      })),
      Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(0),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(1),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(1),
        z: Real64.from(0),
      })),
      Plane.fromPoints(new Vector3({
        x: Real64.from(0),
        y: Real64.from(0),
        z: Real64.from(1),
      }), new Vector3({
        x: Real64.from(1),
        y: Real64.from(0),
        z: Real64.from(1),
      }), new Vector3({
        x: Real64.from(0),
        y: Real64.from(1),
        z: Real64.from(1),
      })),
    ];
    boxes = [
      new Box({
        minX: Real64.from(0),
        maxX: Real64.from(0.1),
        minY: Real64.from(0),
        maxY: Real64.from(0.1),
        minZ: Real64.from(0),
        maxZ: Real64.from(0.1),
      }),
      new Box({
        minX: Real64.from(0.9),
        maxX: Real64.from(1),
        minY: Real64.from(0.9),
        maxY: Real64.from(1),
        minZ: Real64.from(0.9),
        maxZ: Real64.from(1),
      }),
    ];
    room = new Room({
      planes: planes,
      boxes: boxes,
    });
  });

  it('ValidateRoom.run() should not validate an object whose hash is different from the previously commited one', async () => {
    await ValidateRoom.compile();
    const object = Object3D.fromPointAndRadius(new Vector3({
      x: Real64.from(0.5),
      y: Real64.from(0.5),
      z: Real64.from(0.5),
    }), Real64.from(0.02));
    const roomAndObjectCommitment = new RoomAndObjectCommitment({
      room: room,
      objectCommitment: object.getHash(),
    });
    const differentObject = Object3D.fromPointAndRadius(new Vector3({
      x: Real64.from(0.75),
      y: Real64.from(0.75),
      z: Real64.from(0.75),
    }), Real64.from(0.02));

    return expect(async () => await ValidateRoom.run(roomAndObjectCommitment, differentObject)).rejects.toThrow('object must match the previously commited object');
  });

  it('ValidateRoom.run() should validate that the object is inside a cubic room and does not collide with two pieces of furniture.', async () => {
    await ValidateRoom.compile();
    const object = Object3D.fromPointAndRadius(new Vector3({
      x: Real64.from(0.5),
      y: Real64.from(0.5),
      z: Real64.from(0.5),
    }), Real64.from(0.02));
    const roomAndObjectCommitment = new RoomAndObjectCommitment({
      room: room,
      objectCommitment: object.getHash(),
    });

    const proofRaw = await ValidateRoom.run(roomAndObjectCommitment, object)
    const proofJson = proofRaw.toJSON();
    const proof = proofJson.proof;
    expect(proof).toBeTruthy();

  });


});
