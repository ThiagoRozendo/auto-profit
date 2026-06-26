import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import {
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { VehicleStatus } from '../src/generated/prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';

type StoredVehicle = {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  status: VehicleStatus;
  observations: string | null;
  soldAt: Date | null;
  salePrice: number | null;
  saleNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type VehicleCreateData = Omit<
  StoredVehicle,
  'id' | 'createdAt' | 'updatedAt'
>;

class FakePrismaService {
  private vehicles: StoredVehicle[] = [];
  private sequence = 1;

  readonly vehicle = {
    findUnique: ({
      where,
    }: {
      where: { plate?: string };
    }): Promise<StoredVehicle | null> => {
      if (where.plate === undefined) {
        return Promise.resolve(null);
      }

      return Promise.resolve(
        this.vehicles.find((vehicle) => vehicle.plate === where.plate) ?? null,
      );
    },

    findFirst: ({
      where,
    }: {
      where: {
        id?: string;
        ownerId?: string;
        plate?: string;
        NOT?: { id?: string };
      };
    }): Promise<StoredVehicle | null> =>
      Promise.resolve(
        this.vehicles.find((vehicle) => {
          if (where.id !== undefined && vehicle.id !== where.id) {
            return false;
          }

          if (where.ownerId !== undefined && vehicle.ownerId !== where.ownerId) {
            return false;
          }

          if (where.plate !== undefined && vehicle.plate !== where.plate) {
            return false;
          }

          if (where.NOT?.id !== undefined && vehicle.id === where.NOT.id) {
            return false;
          }

          return true;
        }) ?? null,
      ),

    findMany: ({
      where,
    }: {
      where: {
        ownerId?: string;
        status?: VehicleStatus;
        OR?: Array<{
          brand?: { contains: string; mode: string };
          model?: { contains: string; mode: string };
          plate?: { contains: string; mode: string };
        }>;
      };
      orderBy?: { createdAt: 'desc' | 'asc' };
    }): Promise<StoredVehicle[]> => {
      const filtered = this.vehicles.filter((vehicle) => {
        if (where.ownerId !== undefined && vehicle.ownerId !== where.ownerId) {
          return false;
        }

        if (where.status !== undefined && vehicle.status !== where.status) {
          return false;
        }

        if (where.OR && where.OR.length > 0) {
          const matchesSearch = where.OR.some((condition) => {
            if (condition.brand) {
              return vehicle.brand
                .toLowerCase()
                .includes(condition.brand.contains.toLowerCase());
            }

            if (condition.model) {
              return vehicle.model
                .toLowerCase()
                .includes(condition.model.contains.toLowerCase());
            }

            if (condition.plate) {
              return vehicle.plate
                .toLowerCase()
                .includes(condition.plate.contains.toLowerCase());
            }

            return false;
          });

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      });

      return Promise.resolve(
        [...filtered].sort(
          (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        ),
      );
    },

    create: ({
      data,
    }: {
      data: {
        ownerId: string;
        brand: string;
        model: string;
        year: number;
        plate: string;
        purchasePrice: number;
        status: VehicleStatus;
        observations: string | null;
      };
    }): Promise<StoredVehicle> => {
      const now = new Date(`2026-06-26T10:00:0${this.sequence}.000Z`);
      const vehicle: StoredVehicle = {
        id: `veh-${this.sequence++}`,
        ownerId: data.ownerId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        purchasePrice: data.purchasePrice,
        status: data.status,
        observations: data.observations,
        soldAt: null,
        salePrice: null,
        saleNotes: null,
        createdAt: now,
        updatedAt: now,
      };

      this.vehicles.push(vehicle);
      return Promise.resolve(vehicle);
    },

    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<{
        brand: string;
        model: string;
        year: number;
        plate: string;
        purchasePrice: number;
        status: VehicleStatus;
        observations: string | null;
        salePrice: number | null;
        soldAt: Date | null;
        saleNotes: string | null;
      }>;
    }): Promise<StoredVehicle> => {
      const vehicle = this.vehicles.find((item) => item.id === where.id);

      if (!vehicle) {
        throw new Error(`Vehicle ${where.id} not found`);
      }

      Object.assign(vehicle, data, {
        updatedAt: new Date('2026-06-26T15:00:00.000Z'),
      });

      return Promise.resolve(vehicle);
    },

    delete: ({
      where,
    }: {
      where: { id: string };
    }): Promise<StoredVehicle> => {
      const index = this.vehicles.findIndex((item) => item.id === where.id);

      if (index === -1) {
        throw new Error(`Vehicle ${where.id} not found`);
      }

      const [removed] = this.vehicles.splice(index, 1);
      return Promise.resolve(removed);
    },
  };

  reset(): void {
    this.vehicles = [];
    this.sequence = 1;
  }

  seed(data: VehicleCreateData): StoredVehicle {
    const now = new Date(`2026-06-26T09:00:0${this.sequence}.000Z`);
    const vehicle: StoredVehicle = {
      id: `veh-${this.sequence++}`,
      ownerId: data.ownerId,
      brand: data.brand,
      model: data.model,
      year: data.year,
      plate: data.plate,
      purchasePrice: data.purchasePrice,
      status: data.status,
      observations: data.observations ?? null,
      soldAt: data.soldAt ?? null,
      salePrice: data.salePrice ?? null,
      saleNotes: data.saleNotes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.push(vehicle);
    return vehicle;
  }
}

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let fakePrismaService: FakePrismaService;

  const internalHeaders = {
    'x-user-id': '31a217fd-393c-4e1d-9889-b35360eb7cc6',
    'x-user-email': 'joao@email.com',
    'x-user-role': 'SELLER',
  };

  beforeAll(async () => {
    fakePrismaService = new FakePrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    fakePrismaService.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /vehicles should create a vehicle for the authenticated owner', async () => {
    const payload = {
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
      observations: 'Veiculo em bom estado.',
    };

    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .set(internalHeaders)
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'veh-1',
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
    });
  });

  it('POST /vehicles should return 401 when internal user headers are missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        plate: 'ABC1D23',
        purchasePrice: 85000,
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Usuário autenticado não informado',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('POST /vehicles should return 409 for duplicate plates', async () => {
    fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .set(internalHeaders)
      .send({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        plate: 'ABC1D23',
        purchasePrice: 90000,
      })
      .expect(409);

    expect(response.body).toEqual({
      message: 'Já existe um veículo com esta placa',
      error: 'Conflict',
      statusCode: 409,
    });
  });

  it('GET /vehicles should filter by owner, status and search', async () => {
    fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });
    fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      plate: 'XYZ9K88',
      purchasePrice: 92000,
      status: VehicleStatus.SOLD,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });
    fakePrismaService.seed({
      ownerId: 'other-owner',
      brand: 'Honda',
      model: 'City',
      year: 2019,
      plate: 'OUT1D00',
      purchasePrice: 60000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .get('/vehicles')
      .set(internalHeaders)
      .query({ status: 'AVAILABLE', search: 'civ' })
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        ownerId: internalHeaders['x-user-id'],
        brand: 'Honda',
        model: 'Civic',
        status: 'AVAILABLE',
      }),
    ]);
  });

  it('GET /vehicles/:id should return 404 for vehicles from another owner', async () => {
    const vehicle = fakePrismaService.seed({
      ownerId: 'other-owner',
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .get(`/vehicles/${vehicle.id}`)
      .set(internalHeaders)
      .expect(404);

    expect(response.body).toEqual({
      message: 'Veículo não encontrado',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('PATCH /vehicles/:id should update the owned vehicle', async () => {
    const vehicle = fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .patch(`/vehicles/${vehicle.id}`)
      .set(internalHeaders)
      .send({
        model: 'Civic Touring',
        observations: 'Revisado.',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: vehicle.id,
      model: 'Civic Touring',
      observations: 'Revisado.',
    });
  });

  it('PATCH /vehicles/:id should return 409 when updating to an existing plate', async () => {
    const currentVehicle = fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });
    fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      plate: 'XYZ9K88',
      purchasePrice: 90000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .patch(`/vehicles/${currentVehicle.id}`)
      .set(internalHeaders)
      .send({ plate: 'XYZ9K88' })
      .expect(409);

    expect(response.body).toEqual({
      message: 'Já existe um veículo com esta placa',
      error: 'Conflict',
      statusCode: 409,
    });
  });

  it('PATCH /vehicles/:id/sell should mark the vehicle as sold', async () => {
    const vehicle = fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    const response = await request(app.getHttpServer())
      .patch(`/vehicles/${vehicle.id}/sell`)
      .set(internalHeaders)
      .send({
        salePrice: 95000,
        soldAt: '2026-06-26T13:00:00.000Z',
        saleNotes: 'Venda a vista.',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: vehicle.id,
      status: 'SOLD',
      salePrice: 95000,
      saleNotes: 'Venda a vista.',
    });
    expect(response.body.soldAt).toBe('2026-06-26T13:00:00.000Z');
  });

  it('PATCH /vehicles/:id/sell should return 400 when the vehicle is already sold', async () => {
    const vehicle = fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.SOLD,
      observations: null,
      salePrice: 95000,
      soldAt: new Date('2026-06-26T13:00:00.000Z'),
      saleNotes: 'Venda anterior.',
    });

    const response = await request(app.getHttpServer())
      .patch(`/vehicles/${vehicle.id}/sell`)
      .set(internalHeaders)
      .send({ salePrice: 97000 })
      .expect(400);

    expect(response.body).toEqual({
      message: 'Veículo já está vendido',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('DELETE /vehicles/:id should remove the owned vehicle', async () => {
    const vehicle = fakePrismaService.seed({
      ownerId: internalHeaders['x-user-id'],
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: VehicleStatus.AVAILABLE,
      observations: null,
      soldAt: null,
      salePrice: null,
      saleNotes: null,
    });

    await request(app.getHttpServer())
      .delete(`/vehicles/${vehicle.id}`)
      .set(internalHeaders)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/vehicles/${vehicle.id}`)
      .set(internalHeaders)
      .expect(404);
  });

  it('should validate request bodies before reaching the service', async () => {
    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .set(internalHeaders)
      .send({
        brand: '',
        model: '',
        year: '2020',
        plate: '',
        purchasePrice: -1,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'A marca é obrigatória',
        'O modelo é obrigatório',
        'O ano deve ser um número inteiro',
        'A placa é obrigatória',
        'O preço de compra não pode ser negativo',
      ]),
    );
  });
});
